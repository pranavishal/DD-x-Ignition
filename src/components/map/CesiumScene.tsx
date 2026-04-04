"use client";

import { useEffect, useRef } from "react";
import { Building } from "../../types";
import { buildings } from "../../data/buildings";

interface CesiumSceneProps {
  targetLocation: { lat: number; lng: number; name: string } | null;
  onBuildingSelect: (building: Building) => void;
}

export default function CesiumScene({ targetLocation, onBuildingSelect }: CesiumSceneProps) {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const targetLocationRef = useRef(targetLocation);
  const onBuildingSelectRef = useRef(onBuildingSelect);

  // Keep refs updated so the click handler always has the latest values without needing to be recreated
  useEffect(() => {
    targetLocationRef.current = targetLocation;
  }, [targetLocation]);

  useEffect(() => {
    onBuildingSelectRef.current = onBuildingSelect;
  }, [onBuildingSelect]);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const initCesium = () => {
      const Cesium = (window as any).Cesium;
      // If Cesium isn't loaded yet, or if the container is missing, or if we ALREADY initialized the viewer, abort.
      if (!Cesium || !cesiumContainer.current || viewerRef.current) return false;

      // Set the Cesium Ion access token
      Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZGFjNmJjNi0xM2RiLTRhZWQtOTY0Mi0zZTc4OTg4NWM2MDciLCJpZCI6NDEzNTI4LCJpYXQiOjE3NzUyNjE2MjR9.aVjVMND2-4X_kIxjQtBlnAPtuNWu_YAmmWyahRJ3q9E";

      // Initialize Viewer
      const viewer = new Cesium.Viewer(cesiumContainer.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false, // Prevents default popup and camera jump
        sceneModePicker: false,
        selectionIndicator: false, // Prevents the green box and camera jump
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        // Use a free, sleek basemap (CartoDB Light)
        baseLayer: new Cesium.ImageryLayer(
          new Cesium.UrlTemplateImageryProvider({
            url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            credit: "Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
          })
        ),
      });
      
      // Enable depth testing so we can accurately pick the 3D surface coordinates of the buildings
      viewer.scene.globe.depthTestAgainstTerrain = false;
      // Ensure pickPosition works correctly on 3D tiles
      viewer.scene.pickTranslucentDepth = true;
      
      viewerRef.current = viewer;

      // Add OSM Buildings using the modern async method now that we have a token
      Cesium.createOsmBuildingsAsync().then((buildingsTileset: any) => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.scene.primitives.add(buildingsTileset);
        }
      }).catch((err: any) => {
        console.error("Error loading 3D buildings:", err);
      });

      // Fly to the searched location on initial load
      if (targetLocationRef.current) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            targetLocationRef.current.lng,
            targetLocationRef.current.lat - 0.01, // Offset slightly south to look north
            1500 // Height
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-30.0),
          },
          duration: 3, // Smooth flight from space
        });
      }

      // Handle Clicks on ANY building
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      
      // Disable ALL default click behaviors that might cause the camera to move or select
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      
      // Prevent Cesium from automatically tracking or selecting entities
      viewer.trackedEntity = undefined;
      viewer.selectedEntity = undefined;

      // We need to use a ref to hold the latest targetLocation so the click handler can access it
      // without needing to be recreated (which would require putting targetLocation in the dependency array)
      
      handler.setInputAction((click: any) => {
        // Force Cesium to drop any selection it just made behind the scenes
        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;
        
        const pickedObject = viewer.scene.pick(click.position);
        
        if (Cesium.defined(pickedObject) && pickedObject instanceof Cesium.Cesium3DTileFeature) {
          // Extract metadata from the clicked 3D tile
          const featureName = pickedObject.getProperty('name');
          const featureType = pickedObject.getProperty('building');
          const featureHeight = pickedObject.getProperty('cesium_estimated_height');
          
          const name = featureName || (featureType ? `A ${featureType} building` : "Unknown Building");
          const heightStr = featureHeight ? ` standing approximately ${Math.round(featureHeight)} meters tall.` : ".";

          // Get the actual coordinates of the clicked building to pass to the API
          // We EXCLUSIVELY use pickEllipsoid here. 
          // pickPosition on 3D tiles without depth testing often returns the tileset's root bounding volume center (Manhattan).
          // pickEllipsoid mathematically calculates the exact Lat/Lng of the ground directly under the mouse cursor.
          const cartesian = viewer.scene.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
          
          if (Cesium.defined(cartesian)) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);

            // REMOVED: viewer.camera.flyTo(...)
            // We no longer move the camera when a building is clicked.
            // It behaves exactly like original Cesium - you click, the UI opens, the camera stays put.

            // If it's the Empire State Building, use our rich hardcoded data
            if (name.includes("Empire State")) {
              onBuildingSelectRef.current(buildings[0]);
            } else {
              // Generate a dynamic mock building object on the fly for any clicked building
              const dynamicBuilding: Building = {
                id: pickedObject.pickId || Math.random().toString(),
                name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
                address: targetLocationRef.current?.name || "Unknown Location",
                coordinates: { lat, lng, height: featureHeight || 0 },
              yearBuilt: "Unknown",
              originalUse: featureType || "Commercial/Residential",
              currentUse: featureType || "Commercial/Residential",
              summary: `You discovered a building in the heart of the city${heightStr}`,
              timelineEvents: [],
              images: [],
              generatedStory: "",
              storyScenes: [
                {
                  text: "This building stands as a testament to the city's continuous growth and evolution.",
                  imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
                  duration: 4000,
                },
                {
                  text: "Every day, thousands of people pass by its doors, each with their own unique story.",
                  imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
                  duration: 4000,
                }
              ]
            };
            onBuildingSelectRef.current(dynamicBuilding);
          }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      return true;
    };

    // Try to initialize immediately, or poll if Cesium is still downloading
    if (!initCesium()) {
      checkInterval = setInterval(() => {
        if (initCesium()) {
          clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []); // Remove targetLocation and onBuildingSelect from dependencies so it only runs ONCE

  return (
    <div 
      ref={cesiumContainer} 
      className="w-full h-full absolute inset-0" 
      style={{ background: '#000' }}
    />
  );
}
