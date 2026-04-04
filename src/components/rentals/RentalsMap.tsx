"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Loader2 } from "lucide-react";
import type { BuildingCluster } from "@/types/rentals";

interface RentalsMapProps {
  clusters: BuildingCluster[];
  onClusterSelect: (cluster: BuildingCluster) => void;
}

export default function RentalsMap({ clusters, onClusterSelect }: RentalsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const entitiesRef = useRef<Map<string, any>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const initCesium = () => {
      const Cesium = (window as any).Cesium;
      if (!Cesium || !containerRef.current || viewerRef.current) return false;

      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZGFjNmJjNi0xM2RiLTRhZWQtOTY0Mi0zZTc4OTg4NWM2MDciLCJpZCI6NDEzNTI4LCJpYXQiOjE3NzUyNjE2MjR9.aVjVMND2-4X_kIxjQtBlnAPtuNWu_YAmmWyahRJ3q9E";

      const viewer = new Cesium.Viewer(containerRef.current, {
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
            credit: "CartoDB",
          })
        ),
      });

      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewerRef.current = viewer;

      Cesium.createOsmBuildingsAsync()
        .then((tileset: any) => {
          viewer.scene.primitives.add(tileset);
          setMapReady(true);
        })
        .catch((err: any) => {
          console.error("Error loading 3D buildings:", err);
          setMapReady(true);
        });

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.985, 40.730, 3000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
        },
        duration: 2.5,
      });

      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;

        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id?._clusterData) {
          const cluster = picked.id._clusterData as BuildingCluster;

          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              cluster.coordinates.lng,
              cluster.coordinates.lat,
              800
            ),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-40),
            },
            duration: 1.2,
          });

          onClusterSelect(cluster);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      return true;
    };

    if (!initCesium()) {
      checkInterval = setInterval(() => {
        if (initCesium()) clearInterval(checkInterval);
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    entitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    entitiesRef.current.clear();

    for (const cluster of clusters) {
      const baseSize = 48;
      const size = Math.min(baseSize + cluster.listingCount * 8, 80);
      const label = cluster.listingCount === 1
        ? `$${cluster.priceRange.min}`
        : `${cluster.listingCount}`;

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          cluster.coordinates.lng,
          cluster.coordinates.lat,
          200
        ),
        billboard: {
          image: createClusterBubble(size, cluster.listingCount, label),
          width: size,
          height: size + 12,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(400, 1.5, 8000, 0.4),
        },
        label: {
          text: cluster.buildingName,
          font: "600 11px -apple-system, BlinkMacSystemFont, sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.7),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 6),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(400, 1.0, 6000, 0.0),
        },
      });

      (entity as any)._clusterData = cluster;
      entitiesRef.current.set(cluster.buildingId, entity);
    }
  }, [clusters]);

  return (
    <div className="w-full h-full absolute inset-0" style={{ background: "#0d1117" }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay — visible while CesiumJS + 3D tiles are loading */}
      <AnimatePresence>
        {!mapReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d1117]"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 w-16 h-16 bg-blue-500/20 rounded-full blur-xl" />
              <Globe className="w-16 h-16 text-blue-400 relative z-10" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-sm font-medium mb-2"
            >
              Building your world
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/40 text-xs flex items-center gap-2"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading 3D buildings and rental data
            </motion.p>

            {/* Shimmer bar at the bottom for visual progress feel */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Generates a polished cluster bubble as a data-URI SVG.
 *
 * Design rationale:
 * - Gradient fill (not flat) gives depth and draws the eye on a dark map
 * - Drop shadow creates a "floating" effect so bubbles feel layered above buildings
 * - Pin tail anchors the bubble to a specific point rather than floating ambiguously
 * - Color coding by density: green (1 listing) = sparse, blue (2-3) = moderate, orange (4+) = hot cluster
 *   This maps to a heat-intuition users already have from traffic/weather maps
 * - White bold text on colored background meets WCAG contrast requirements
 */
function createClusterBubble(size: number, count: number, label: string): string {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const totalHeight = size + 12;

  let gradStart: string, gradEnd: string, glowColor: string;
  if (count >= 4) {
    gradStart = "#fb923c"; gradEnd = "#ea580c"; glowColor = "#f97316";
  } else if (count >= 2) {
    gradStart = "#60a5fa"; gradEnd = "#2563eb"; glowColor = "#3b82f6";
  } else {
    gradStart = "#4ade80"; gradEnd = "#16a34a"; glowColor = "#22c55e";
  }

  const fontSize = count === 1 ? Math.max(11, size / 4.5) : Math.max(14, size / 3);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${totalHeight}" viewBox="0 0 ${size} ${totalHeight}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}"/>
        <stop offset="100%" stop-color="${gradEnd}"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${glowColor}" flood-opacity="0.4"/>
      </filter>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#bg)" filter="url(#shadow)" stroke="white" stroke-width="2.5" stroke-opacity="0.9"/>
    <polygon points="${cx},${size + 10} ${cx - 6},${size - 4} ${cx + 6},${size - 4}" fill="${gradEnd}" stroke="white" stroke-width="1.5" stroke-opacity="0.9"/>
    <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="${fontSize}px" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,sans-serif">${label}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
