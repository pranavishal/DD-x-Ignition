"use client";

import { useEffect, useRef } from "react";
import type { BuildingCluster } from "@/types/rentals";

interface RentalsMapProps {
  clusters: BuildingCluster[];
  onClusterSelect: (cluster: BuildingCluster) => void;
}

/**
 * CesiumJS 3D globe showing rental clusters as clickable billboards.
 * Each bubble is sized by listing count and labeled with price range.
 */
export default function RentalsMap({ clusters, onClusterSelect }: RentalsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const entitiesRef = useRef<Map<string, any>>(new Map());

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
        .then((tileset: any) => viewer.scene.primitives.add(tileset))
        .catch((err: any) => console.error("Error loading 3D buildings:", err));

      // Default view: Manhattan
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.985, 40.730, 3000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
        },
        duration: 2,
      });

      // Click handler for cluster entities
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
          onClusterSelect(picked.id._clusterData as BuildingCluster);
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

  // Update cluster entities when data changes
  useEffect(() => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    // Remove old cluster entities
    entitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    entitiesRef.current.clear();

    for (const cluster of clusters) {
      const size = Math.min(20 + cluster.listingCount * 12, 64);
      const label = cluster.listingCount === 1
        ? `$${cluster.priceRange.min}`
        : `${cluster.listingCount} stays`;

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          cluster.coordinates.lng,
          cluster.coordinates.lat,
          200
        ),
        billboard: {
          image: createBubbleSVG(size, cluster.listingCount, label),
          width: size,
          height: size,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(500, 1.4, 8000, 0.5),
        },
        label: {
          text: cluster.buildingName,
          font: "12px sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 8),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      (entity as any)._clusterData = cluster;
      entitiesRef.current.set(cluster.buildingId, entity);
    }
  }, [clusters]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0"
      style={{ background: "#0d1117" }}
    />
  );
}

function createBubbleSVG(size: number, count: number, label: string): string {
  const color = count >= 4 ? "#f97316" : count >= 2 ? "#3b82f6" : "#22c55e";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" fill-opacity="0.85" stroke="white" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 1}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="${Math.max(10, size / 4)}px" font-weight="bold" font-family="sans-serif">${label}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
