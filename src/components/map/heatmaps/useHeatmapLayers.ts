import { useRef, useCallback } from "react";
import type { HeatmapLayerId } from "@/types";
import { generateHeatmapGrid, MANHATTAN_BOUNDS } from "./generateMockGeoJSON";

// Color scales: [r, g, b] for low and high ends of the value range
const LAYER_COLORS: Record<HeatmapLayerId, { low: [number, number, number]; high: [number, number, number] }> = {
  walkability: { low: [255, 60,  60],  high: [60,  255, 120] }, // red → green
  noise:       { low: [60,  200, 255], high: [255, 80,  40]  }, // cyan → red
  crime:       { low: [60,  255, 180], high: [255, 40,  40]  }, // green → red
  radon:       { low: [60,  200, 255], high: [255, 160, 0]   }, // cyan → orange
};

const LAYER_SEEDS: Record<HeatmapLayerId, number> = {
  walkability: 42,
  noise:       137,
  crime:       256,
  radon:       512,
};

export function useHeatmapLayers(viewerRef: React.RefObject<any>) {
  const layerPrimitives = useRef<Map<HeatmapLayerId, any>>(new Map());

  const addLayer = useCallback((layerId: HeatmapLayerId) => {
    const viewer = viewerRef.current;
    if (!viewer || layerPrimitives.current.has(layerId)) return;

    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    const geojson = generateHeatmapGrid(MANHATTAN_BOUNDS, 20, LAYER_SEEDS[layerId]);
    const colors = LAYER_COLORS[layerId];
    const instances: any[] = [];

    for (const feature of geojson.features) {
      const value = (feature.properties as { value: number }).value;
      const coords: [number, number][] = feature.geometry.coordinates[0];

      const r = (colors.low[0] + (colors.high[0] - colors.low[0]) * value) / 255;
      const g = (colors.low[1] + (colors.high[1] - colors.low[1]) * value) / 255;
      const b = (colors.low[2] + (colors.high[2] - colors.low[2]) * value) / 255;

      const positions = coords.map(([lng, lat]) =>
        Cesium.Cartesian3.fromDegrees(lng, lat)
      );

      instances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(positions),
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              new Cesium.Color(r, g, b, 0.35)
            ),
          },
        })
      );
    }

    const primitive = new Cesium.GroundPrimitive({
      geometryInstances: instances,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        translucent: true,
      }),
    });

    viewer.scene.groundPrimitives.add(primitive);
    layerPrimitives.current.set(layerId, primitive);
  }, [viewerRef]);

  const removeLayer = useCallback((layerId: HeatmapLayerId) => {
    const viewer = viewerRef.current;
    const primitive = layerPrimitives.current.get(layerId);
    if (!viewer || !primitive) return;

    viewer.scene.groundPrimitives.remove(primitive);
    layerPrimitives.current.delete(layerId);
  }, [viewerRef]);

  const toggleLayer = useCallback((layerId: HeatmapLayerId, enabled: boolean) => {
    if (enabled) {
      addLayer(layerId);
    } else {
      removeLayer(layerId);
    }
  }, [addLayer, removeLayer]);

  const removeAllLayers = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    for (const [, prim] of layerPrimitives.current) {
      viewer.scene.groundPrimitives.remove(prim);
    }
    layerPrimitives.current.clear();
  }, [viewerRef]);

  return { toggleLayer, removeAllLayers };
}
