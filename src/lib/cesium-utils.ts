/**
 * Cesium utility functions shared across engineers.
 * Engineer 1 owns this file. Other engineers call these exports.
 */

// ── Camera orbit state ──────────────────────────────────────────────────────

let orbitListenerRemove: (() => void) | null = null;

/**
 * Flies the camera to a building then begins a slow continuous orbit.
 */
export function zoomToBuilding(
  viewer: any,
  target: any, // Cesium.Cartesian3
  height: number,
  onComplete?: () => void
): void {
  const Cesium = (window as any).Cesium;
  if (!Cesium || !viewer) return;

  const carto = Cesium.Cartographic.fromCartesian(target);
  const cameraAltitude = Math.max(height * 2.5, 200);

  const offsetLng = Cesium.Math.toDegrees(carto.longitude) - 0.0005;
  const offsetLat = Cesium.Math.toDegrees(carto.latitude) - 0.0003;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(offsetLng, offsetLat, cameraAltitude),
    orientation: {
      heading: Cesium.Math.toRadians(30),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0.0,
    },
    duration: 1.8,
    complete: () => {
      startOrbit(viewer, target, cameraAltitude);
      onComplete?.();
    },
  });
}

/**
 * Begins a slow continuous orbit around a target Cartesian3 point.
 */
export function startOrbit(
  viewer: any,
  center: any, // Cesium.Cartesian3
  altitude: number,
  degreesPerSecond: number = 3
): void {
  const Cesium = (window as any).Cesium;
  if (!Cesium) return;

  stopOrbit();

  // Capture orbit start time so the heading is relative to when orbiting began
  const orbitStartTime = Cesium.JulianDate.clone(viewer.clock.currentTime);

  const listener = viewer.clock.onTick.addEventListener((clock: any) => {
    const delta = Cesium.JulianDate.secondsDifference(clock.currentTime, orbitStartTime);
    const heading = Cesium.Math.toRadians(delta * degreesPerSecond);

    const carto = Cesium.Cartographic.fromCartesian(center);
    const lng = Cesium.Math.toDegrees(carto.longitude);
    const lat = Cesium.Math.toDegrees(carto.latitude);

    const radius = 0.002;
    const camLng = lng + radius * Math.cos(heading);
    const camLat = lat + radius * Math.sin(heading);

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(camLng, camLat, altitude),
      orientation: {
        heading: heading + Math.PI,
        pitch: Cesium.Math.toRadians(-30),
        roll: 0.0,
      },
    });
  });

  orbitListenerRemove = () => listener();
}

/**
 * Stops any active orbit animation.
 */
export function stopOrbit(): void {
  if (orbitListenerRemove) {
    orbitListenerRemove();
    orbitListenerRemove = null;
  }
}

// ── Integration contracts for other engineers ───────────────────────────────

/**
 * [For Engineer 2 — Journeys]
 * Draws a journey path (GeoJSON LineString) on the Cesium globe.
 * Returns a cleanup function to remove the path.
 */
export function renderJourneyPath(
  viewer: any,
  pathGeoJSON: { type: string; coordinates: [number, number][] },
  color: string = "#00ffcc"
): () => void {
  const Cesium = (window as any).Cesium;
  if (!Cesium || !viewer) return () => {};

  const positions = pathGeoJSON.coordinates.map(([lng, lat]: [number, number]) =>
    Cesium.Cartesian3.fromDegrees(lng, lat)
  );

  const entity = viewer.entities.add({
    polyline: {
      positions,
      width: 4,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.25,
        color: Cesium.Color.fromCssColorString(color),
      }),
      clampToGround: true,
    },
  });

  return () => viewer.entities.remove(entity);
}

/**
 * [For Engineer 3 — Rentals]
 * Places a labeled bubble marker above a building.
 * Returns a cleanup function to remove the bubble.
 */
export function addRentalBubble(
  viewer: any,
  position: { lat: number; lng: number },
  count: number,
  onClick: () => void
): () => void {
  const Cesium = (window as any).Cesium;
  if (!Cesium || !viewer) return () => {};

  const canvas = createBubbleCanvas(count);

  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(position.lng, position.lat, 120),
    billboard: {
      image: canvas,
      scale: 0.6,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });

  // Attach click handler so CesiumScene can invoke it on pick
  (entity as any)._rentalClickHandler = onClick;

  return () => viewer.entities.remove(entity);
}

function createBubbleCanvas(count: number): HTMLCanvasElement {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Glow ring
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 200, 255, 0.3)";
  ctx.fill();

  // Inner circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 180, 255, 0.85)";
  ctx.fill();

  // Count text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(count), size / 2, size / 2);

  return canvas;
}
