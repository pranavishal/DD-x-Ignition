"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { JourneyData, Building, JourneyLandmark } from "../../types";

interface JourneyRoutePreviewProps {
  journeyData: JourneyData;
  viewer: any;
  onStart: () => void;
  onCancel: () => void;
  onLandmarkClick?: (building: Building) => void;
}

function landmarkToBuilding(lm: JourneyLandmark, cityName: string, index: number): Building {
  return {
    id: `journey-landmark-${index}`,
    name: lm.name,
    address: cityName,
    coordinates: { lat: lm.lat, lng: lm.lng, height: 0 },
    yearBuilt: "Unknown",
    originalUse: "Landmark",
    currentUse: "Landmark",
    summary: lm.narration,
    timelineEvents: [],
    images: [],
    generatedStory: "",
    storyScenes: [],
  };
}

function createMarkerCanvas(num: number): string {
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + 14;
  const ctx = canvas.getContext("2d")!;

  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  // Circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.fillStyle = "#6366f1";
  ctx.fill();

  // Pin tail
  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.moveTo(size / 2 - 10, size / 2 + 14);
  ctx.lineTo(size / 2, size + 10);
  ctx.lineTo(size / 2 + 10, size / 2 + 14);
  ctx.fillStyle = "#6366f1";
  ctx.fill();

  // White border
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Number
  ctx.fillStyle = "white";
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(num), size / 2, size / 2);

  return canvas.toDataURL();
}

export default function JourneyRoutePreview({
  journeyData,
  viewer,
  onStart,
  onCancel,
  onLandmarkClick,
}: JourneyRoutePreviewProps) {
  const entitiesRef = useRef<any[]>([]);
  const pinEntityMapRef = useRef<Map<any, number>>(new Map());
  const onLandmarkClickRef = useRef(onLandmarkClick);
  onLandmarkClickRef.current = onLandmarkClick;
  const timersRef = useRef<{ delay?: ReturnType<typeof setTimeout>; tick?: ReturnType<typeof setInterval> }>({});
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Draw route entities on the map (no camera movement)
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    const landmarks = journeyData.landmarks;
    if (!landmarks.length) return;

    entitiesRef.current.forEach((e) => {
      try {
        viewer.entities.remove(e);
      } catch (_) {
        /* already removed */
      }
    });
    entitiesRef.current = [];
    pinEntityMapRef.current.clear();

    const markerImages = landmarks.map((_, i) => createMarkerCanvas(i + 1));

    landmarks.forEach((lm, i) => {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lm.lng, lm.lat, 30),
        billboard: {
          image: markerImages[i],
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 0.85,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: lm.name,
          font: "bold 13px system-ui, -apple-system, sans-serif",
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -58),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      entitiesRef.current.push(entity);
      pinEntityMapRef.current.set(entity, i);
    });

    // Click handler for pin entities
    const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    clickHandler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id) {
        const index = pinEntityMapRef.current.get(picked.id);
        if (index !== undefined) {
          const lm = landmarks[index];
          onLandmarkClickRef.current?.(
            landmarkToBuilding(lm, journeyData.cityName, index)
          );
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    const routeCoords = journeyData.routeCoordinates;
    const positions =
      routeCoords && routeCoords.length > 0
        ? routeCoords.map((c) => Cesium.Cartesian3.fromDegrees(c.lng, c.lat))
        : landmarks.map((lm) => Cesium.Cartesian3.fromDegrees(lm.lng, lm.lat));

    const routeBorder = viewer.entities.add({
      polyline: {
        positions,
        width: 9,
        material: Cesium.Color.fromCssColorString("rgba(30, 27, 75, 0.7)"),
        clampToGround: true,
      },
    });
    entitiesRef.current.push(routeBorder);

    const routeLine = viewer.entities.add({
      polyline: {
        positions,
        width: 5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Cesium.Color.fromCssColorString("#818cf8"),
        }),
        clampToGround: true,
      },
    });
    entitiesRef.current.push(routeLine);

    // 5-second countdown — starts immediately (camera is already positioned from initial fly-in)
    let remaining = 5;
    setCountdown(remaining);
    timersRef.current.tick = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timersRef.current.tick);
        timersRef.current.tick = undefined;
        setReady(true);
      }
    }, 1000);

    return () => {
      clickHandler.destroy();
      pinEntityMapRef.current.clear();
      if (timersRef.current.delay) clearTimeout(timersRef.current.delay);
      if (timersRef.current.tick) clearInterval(timersRef.current.tick);
      entitiesRef.current.forEach((e) => {
        try {
          if (viewer && !viewer.isDestroyed()) viewer.entities.remove(e);
        } catch (_) {
          /* already destroyed */
        }
      });
      entitiesRef.current = [];
    };
  }, [viewer, journeyData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] pointer-events-none"
    >
      {/* Close button */}
      <div className="absolute top-4 right-4 pointer-events-auto z-10">
        <button
          onClick={onCancel}
          className="p-2.5 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
          title="Cancel journey"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Route overview card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 pointer-events-auto"
      >
        <div className="mx-4 mb-4 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden max-w-lg sm:mx-auto">
          {/* Header */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-indigo-400 font-semibold">
              Your Route
            </p>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {journeyData.cityName}
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              {journeyData.landmarks.length} stops &middot; {journeyData.intro}
            </p>
          </div>

          {/* Stop list */}
          <div className="px-5 pb-2 max-h-[28vh] overflow-y-auto">
            {journeyData.landmarks.map((lm, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  onLandmarkClick?.(
                    landmarkToBuilding(lm, journeyData.cityName, i)
                  )
                }
                className="flex items-start gap-3 py-2 w-full text-left hover:bg-white/5 rounded-lg transition-colors -mx-1 px-1"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-indigo-300">
                      {i + 1}
                    </span>
                  </div>
                  {i < journeyData.landmarks.length - 1 && (
                    <div className="w-px h-5 bg-white/10 mt-1" />
                  )}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-white truncate">
                    {lm.name}
                  </p>
                  <p className="text-[11px] text-white/35 truncate">
                    {lm.narration}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="px-5 pb-4 pt-2">
            <button
              onClick={ready ? onStart : undefined}
              disabled={!ready}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                ready
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
                  : "bg-white/10 text-white/40 cursor-default"
              }`}
            >
              {ready ? (
                <>
                  <Play className="w-4 h-4" fill="white" />
                  Begin Journey
                </>
              ) : (
                <>Starting in {countdown}s</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
