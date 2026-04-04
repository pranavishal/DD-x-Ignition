"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Building, HeatmapLayerId, StoryScene } from "@/types";
import { findNearestMockBuilding } from "@/data/mock-buildings";
import { zoomToBuilding, stopOrbit } from "@/lib/cesium-utils";
import { useHeatmapLayers } from "@/components/map/heatmaps";
import VastuPanel from "@/components/ui/VastuPanel";
import SafetyToggle from "@/components/map/SafetyToggle";
import StoryModal from "@/components/ui/StoryModal";

interface CesiumSceneProps {
  targetLocation: { lat: number; lng: number; name: string } | null;
  onBuildingSelect?: (building: Building) => void;
}

export default function CesiumScene({ targetLocation, onBuildingSelect }: CesiumSceneProps) {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [activeStoryScenes, setActiveStoryScenes] = useState<StoryScene[]>([]);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | undefined>(undefined);

  const { toggleLayer } = useHeatmapLayers(viewerRef);

  // ── Cesium initialization ────────────────────────────────────────────────

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const initCesium = () => {
      const Cesium = (window as any).Cesium;
      if (!Cesium || !cesiumContainer.current || viewerRef.current) return false;

      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZGFjNmJjNi0xM2RiLTRhZWQtOTY0Mi0zZTc4OTg4NWM2MDciLCJpZCI6NDEzNTI4LCJpYXQiOjE3NzUyNjE2MjR9.aVjVMND2-4X_kIxjQtBlnAPtuNWu_YAmmWyahRJ3q9E";

      const viewer = new Cesium.Viewer(cesiumContainer.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        baseLayer: new Cesium.ImageryLayer(
          new Cesium.UrlTemplateImageryProvider({
            url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            credit: "Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
          })
        ),
      });

      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.scene.pickTranslucentDepth = true;
      viewerRef.current = viewer;

      // Expose globally for Engineers 2, 3, 4
      (window as any).__cesiumViewer = viewer;

      // OSM 3D buildings
      Cesium.createOsmBuildingsAsync()
        .then((tileset: any) => viewer.scene.primitives.add(tileset))
        .catch((err: any) => console.error("OSM buildings error:", err));

      // Fly to searched location
      if (targetLocation) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            targetLocation.lng,
            targetLocation.lat - 0.01,
            1500
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-30.0),
          },
          duration: 3,
        });
      }

      // Remove default click behaviors
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
      viewer.trackedEntity = undefined;
      viewer.selectedEntity = undefined;

      // ── Building click handler ──────────────────────────────────────────

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction((click: any) => {
        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;

        const pickedObject = viewer.scene.pick(click.position);

        if (
          Cesium.defined(pickedObject) &&
          pickedObject instanceof Cesium.Cesium3DTileFeature
        ) {
          const featureName = pickedObject.getProperty("name");
          const featureType = pickedObject.getProperty("building");
          const featureHeight =
            pickedObject.getProperty("cesium_estimated_height") ??
            pickedObject.getProperty("height") ??
            100;

          const name =
            featureName ||
            (featureType ? `A ${featureType} building` : "Unknown Building");

          const cartesian = viewer.scene.camera.pickEllipsoid(
            click.position,
            viewer.scene.globe.ellipsoid
          );
          if (!Cesium.defined(cartesian)) return;

          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);

          // Try to match a known mock building first
          const mockMatch = findNearestMockBuilding(lat, lng);

          const buildingData: Building = mockMatch
            ? (mockMatch as Building)
            : {
                id: pickedObject.pickId || Math.random().toString(),
                name: name.charAt(0).toUpperCase() + name.slice(1),
                address: targetLocation?.name || "Unknown Location",
                coordinates: { lat, lng, height: featureHeight },
                height: featureHeight,
                yearBuilt: "Unknown",
                originalUse: featureType || "Commercial/Residential",
                currentUse: featureType || "Commercial/Residential",
                summary: `A building standing approximately ${Math.round(featureHeight)}m tall in the heart of the city.`,
                timelineEvents: [],
                images: [],
                generatedStory: "",
                storyScenes: [],
              };

          // Fly camera to building + start orbit
          zoomToBuilding(viewer, cartesian, featureHeight);

          // Open Vastu panel
          setSelectedBuilding(buildingData);
          setPanelOpen(true);

          // Dispatch cross-engineer event
          window.dispatchEvent(
            new CustomEvent("building-selected", {
              detail: { building: buildingData, coordinates: { lat, lng } },
            })
          );

          // Notify parent (backwards compat)
          onBuildingSelect?.(buildingData);
        } else {
          // Clicked empty space
          stopOrbit();
          setPanelOpen(false);
          setSelectedBuilding(null);
          window.dispatchEvent(new CustomEvent("building-deselected"));
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Stop orbit when user manually moves the camera
      const orbitBreaker = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      orbitBreaker.setInputAction(() => stopOrbit(), Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
      orbitBreaker.setInputAction(() => stopOrbit(), Cesium.ScreenSpaceEventType.RIGHT_DOWN);
      orbitBreaker.setInputAction(() => stopOrbit(), Cesium.ScreenSpaceEventType.WHEEL);

      return true;
    };

    if (!initCesium()) {
      checkInterval = setInterval(() => {
        if (initCesium()) clearInterval(checkInterval);
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      stopOrbit();
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        (window as any).__cesiumViewer = null;
      }
    };
  }, [targetLocation, onBuildingSelect]);

  // ── Story generation ──────────────────────────────────────────────────────

  const handleGenerateStory = async () => {
    if (!selectedBuilding) return;
    setIsGeneratingStory(true);
    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedBuilding.name,
          lat: selectedBuilding.coordinates.lat,
          lng: selectedBuilding.coordinates.lng,
          type: selectedBuilding.originalUse,
        }),
      });
      if (!response.ok) throw new Error("Story generation failed");
      const data = await response.json();

      // Update building with generated story scenes so Historical tab shows them
      setSelectedBuilding((prev) =>
        prev ? { ...prev, storyScenes: data.storyScenes, audioUrl: data.audioUrl } : prev
      );
      setIsGeneratingStory(false);
      // Auto-switch to story player
      setActiveStoryScenes(data.storyScenes);
      setActiveAudioUrl(data.audioUrl);
      setIsStoryPlaying(true);
    } catch (err) {
      console.error("Story generation error:", err);
      setIsGeneratingStory(false);
      if (selectedBuilding.storyScenes?.length) {
        setActiveStoryScenes(selectedBuilding.storyScenes);
        setActiveAudioUrl(selectedBuilding.audioUrl);
        setIsStoryPlaying(true);
      }
    }
  };

  const handlePlayStory = (scenes: StoryScene[], audioUrl?: string) => {
    setActiveStoryScenes(scenes);
    setActiveAudioUrl(audioUrl);
    setIsStoryPlaying(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Cesium globe container */}
      <div
        ref={cesiumContainer}
        className="w-full h-full absolute inset-0"
        style={{ background: "#000" }}
      />

      {/* Vastu panel overlay */}
      <VastuPanel
        building={selectedBuilding}
        isOpen={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          stopOrbit();
          window.dispatchEvent(new CustomEvent("building-deselected"));
        }}
        onGenerateStory={handleGenerateStory}
        isGeneratingStory={isGeneratingStory}
        onPlayStory={handlePlayStory}
      />

      {/* Safety heatmap toggle */}
      <SafetyToggle
        onToggle={(layerId: HeatmapLayerId, enabled: boolean) =>
          toggleLayer(layerId, enabled)
        }
      />

      {/* Full-screen story player */}
      <AnimatePresence>
        {isStoryPlaying && selectedBuilding && (
          <StoryModal
            building={{
              ...selectedBuilding,
              storyScenes: activeStoryScenes,
              audioUrl: activeAudioUrl,
            }}
            onClose={() => setIsStoryPlaying(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
