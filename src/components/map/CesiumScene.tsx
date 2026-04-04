"use client";

import { useEffect, useRef } from "react";
import { Building } from "../../types";

interface CesiumSceneProps {
  buildings: Building[];
  onBuildingSelect: (building: Building) => void;
}

export default function CesiumScene({ buildings, onBuildingSelect }: CesiumSceneProps) {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const initCesium = () => {
      const Cesium = (window as any).Cesium;
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
      
      viewerRef.current = viewer;

      // Add OSM Buildings using the modern async method now that we have a token
      Cesium.createOsmBuildingsAsync().then((buildingsTileset: any) => {
        viewer.scene.primitives.add(buildingsTileset);
      }).catch((err: any) => {
        console.error("Error loading 3D buildings:", err);
      });

      // Fly to New York City on initial load
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          -73.9857,
          40.7384, // Slightly south of Empire State
          1000 // Height
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-30.0),
        },
        duration: 0, // Set to 0 to instantly load there instead of flying from space
      });

      // Handle Clicks on ANY building
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      
      // Disable default double-click zoom to keep the camera completely static when interacting
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      // Disable default single-click behavior (which sometimes triggers a fly-to or selection indicator)
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((click: any) => {
        const pickedObject = viewer.scene.pick(click.position);
        
        if (Cesium.defined(pickedObject) && pickedObject instanceof Cesium.Cesium3DTileFeature) {
          // Extract metadata from the clicked 3D tile
          const featureName = pickedObject.getProperty('name');
          const featureType = pickedObject.getProperty('building');
          const featureHeight = pickedObject.getProperty('cesium_estimated_height');
          
          const name = featureName || (featureType ? `A ${featureType} building` : "Unknown Building");
          const heightStr = featureHeight ? ` standing approximately ${Math.round(featureHeight)} meters tall.` : ".";

          // If it's the Empire State Building, use our rich hardcoded data
          if (name.includes("Empire State")) {
            onBuildingSelect(buildings[0]);
          } else {
            // Generate a dynamic mock building object on the fly for any other building
            const dynamicBuilding: Building = {
              id: pickedObject.pickId || Math.random().toString(),
              name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
              address: "New York City",
              coordinates: { lat: 40.7, lng: -74.0, height: 0 },
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
            onBuildingSelect(dynamicBuilding);
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
  }, [buildings, onBuildingSelect]);

  return (
    <div 
      ref={cesiumContainer} 
      className="w-full h-full absolute inset-0" 
      style={{ background: '#000' }}
    />
  );
}
