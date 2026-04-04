/**
 * Generates a grid of square GeoJSON polygons covering a bounding box.
 * Each feature has a `value` property in [0, 1] based on a seeded RNG
 * so the data is reproducible and varies per layer.
 */
export function generateHeatmapGrid(
  bounds: { west: number; south: number; east: number; north: number },
  gridSize: number = 20,
  seed: number = 42
): { type: "FeatureCollection"; features: any[] } {
  const features: any[] = [];
  const lngStep = (bounds.east - bounds.west) / gridSize;
  const latStep = (bounds.north - bounds.south) / gridSize;

  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const west = bounds.west + col * lngStep;
      const south = bounds.south + row * latStep;
      const east = west + lngStep;
      const north = south + latStep;

      features.push({
        type: "Feature",
        properties: { value: parseFloat(random().toFixed(3)) },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [west, south],
            [east, south],
            [east, north],
            [west, north],
            [west, south],
          ]],
        },
      });
    }
  }

  return { type: "FeatureCollection", features };
}

// Bounding box covering central Manhattan for the demo
export const MANHATTAN_BOUNDS = {
  west: -74.02,
  south: 40.70,
  east: -73.97,
  north: 40.78,
};
