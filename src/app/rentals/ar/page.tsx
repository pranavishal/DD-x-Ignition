"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Navigation,
  Star,
  ScanLine,
  X,
  Building2,
  Calendar,
  Compass,
  Lightbulb,
  User,
} from "lucide-react";
import Link from "next/link";
import type { RentalListing } from "@/types/rentals";

interface ARMarker {
  listing: RentalListing;
  screenX: number;
  screenY: number;
  distance: number;
}

interface BuildingInfo {
  name: string;
  year: string;
  style: string;
  architect: string;
  history: string;
  funFact: string;
}

export default function ARViewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState(0);
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [markers, setMarkers] = useState<ARMarker[]>([]);
  const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);

  const [scanning, setScanning] = useState(false);
  const [buildingInfo, setBuildingInfo] = useState<BuildingInfo | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch {
        setCameraError("Camera access denied. Please allow camera permissions to use AR view.");
      }
    }

    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setCameraError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPos({ lat: 40.7484, lng: -73.9967 }),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const h = (e as any).webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : 0);
      setHeading(h);
    };

    if (typeof DeviceOrientationEvent !== "undefined") {
      const dOE = DeviceOrientationEvent as any;
      if (typeof dOE.requestPermission === "function") {
        dOE.requestPermission().then((perm: string) => {
          if (perm === "granted") window.addEventListener("deviceorientation", handler, true);
        });
      } else {
        window.addEventListener("deviceorientation", handler, true);
      }
    }

    return () => window.removeEventListener("deviceorientation", handler, true);
  }, []);

  useEffect(() => {
    if (!userPos) return;

    fetch(`/api/rentals/search?lat=${userPos.lat}&lng=${userPos.lng}&radius=2`)
      .then((r) => r.json())
      .then((data) => {
        const all = data.clusters?.flatMap((c: any) => c.listings) ?? [];
        setListings(all);
      })
      .catch(console.error);
  }, [userPos]);

  const projectMarkers = useCallback(() => {
    if (!userPos || !listings.length) return;

    const FOV = 60;
    const halfFOV = FOV / 2;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const projected: ARMarker[] = [];

    for (const listing of listings) {
      const bearing = getBearing(userPos.lat, userPos.lng, listing.coordinates.lat, listing.coordinates.lng);
      const distance = getDistance(userPos.lat, userPos.lng, listing.coordinates.lat, listing.coordinates.lng);

      let angleDiff = bearing - heading;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      if (Math.abs(angleDiff) > halfFOV) continue;

      const screenX = ((angleDiff + halfFOV) / FOV) * screenW;
      const screenY = screenH * 0.3 + Math.min(distance * 30, screenH * 0.3);

      projected.push({ listing, screenX, screenY, distance });
    }

    projected.sort((a, b) => b.distance - a.distance);
    setMarkers(projected);
  }, [userPos, listings, heading]);

  useEffect(() => {
    const interval = setInterval(projectMarkers, 100);
    return () => clearInterval(interval);
  }, [projectMarkers]);

  // ── Scan building with GPT-4o Vision ──────────────────────────────
  const scanBuilding = async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;

    setScanning(true);
    setScanError(null);
    setBuildingInfo(null);
    setSelectedListing(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setScanning(false);
      setScanError("Could not capture frame");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          lat: userPos?.lat,
          lng: userPos?.lng,
        }),
      });

      if (!res.ok) throw new Error("Vision API returned an error");

      const data: BuildingInfo = await res.json();
      setBuildingInfo(data);
    } catch (err: any) {
      setScanError(err.message || "Failed to identify building");
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Scanning overlay */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/40" />
            {/* Scanning corners animation */}
            <div className="relative w-64 h-64">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ScanLine className="w-8 h-8 text-blue-400 animate-pulse mb-2" />
                <p className="text-sm font-medium text-white">Identifying building...</p>
                <p className="text-xs text-white/50 mt-1">Powered by GPT-4o Vision</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading / Error overlay */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm text-white/70">Starting camera...</p>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 p-6">
          <div className="text-center text-white max-w-sm">
            <p className="text-lg font-semibold mb-2">Camera Unavailable</p>
            <p className="text-sm text-white/60 mb-4">{cameraError}</p>
            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Map View
            </Link>
          </div>
        </div>
      )}

      {/* AR Markers */}
      {!buildingInfo &&
        markers.map((m) => (
          <button
            key={m.listing.id}
            onClick={() => setSelectedListing(m.listing)}
            className="absolute transform -translate-x-1/2 -translate-y-full group"
            style={{ left: m.screenX, top: m.screenY }}
          >
            <div className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl shadow-lg border border-blue-400/30 text-xs font-medium whitespace-nowrap transition-transform group-hover:scale-110">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span className="font-bold">
                  ${m.listing.price}
                  <span className="font-normal text-white/70">/{m.listing.priceUnit}</span>
                </span>
              </div>
              <div className="text-[10px] text-white/60 mt-0.5">{m.distance.toFixed(1)} km away</div>
            </div>
            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1 animate-pulse" />
          </button>
        ))}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between pointer-events-none">
        <Link
          href="/rentals"
          className="pointer-events-auto flex items-center gap-1.5 text-sm text-white bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full transition-colors hover:bg-black/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Map View
        </Link>

        <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs text-white/70">
          <Navigation className="w-3.5 h-3.5" style={{ transform: `rotate(${heading}deg)` }} />
          {Math.round(heading)}°
          <span className="text-white/40">·</span>
          {markers.length} nearby
        </div>
      </div>

      {/* ── SCAN BUILDING BUTTON ─────────────────────────────────── */}
      {cameraReady && !scanning && !buildingInfo && (
        <div className="absolute bottom-28 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <button
            onClick={scanBuilding}
            className="pointer-events-auto flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-blue-500/30 font-semibold text-sm transition-all active:scale-95 border border-white/20"
          >
            <ScanLine className="w-5 h-5" />
            Scan Building
          </button>
        </div>
      )}

      {/* Scan error toast */}
      <AnimatePresence>
        {scanError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-32 left-4 right-4 z-50 bg-red-600/90 backdrop-blur-md text-white p-3 rounded-xl text-sm text-center"
          >
            {scanError}
            <button onClick={() => setScanError(null)} className="ml-2 underline">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BUILDING INFO CARD ───────────────────────────────────── */}
      <AnimatePresence>
        {buildingInfo && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-5 max-h-[65vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <h3 className="text-lg font-bold text-white truncate">{buildingInfo.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {buildingInfo.year && buildingInfo.year !== "Unknown" && (
                    <span className="flex items-center gap-1 text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {buildingInfo.year}
                    </span>
                  )}
                  {buildingInfo.style && buildingInfo.style !== "Unknown" && (
                    <span className="flex items-center gap-1 text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                      <Compass className="w-3 h-3" />
                      {buildingInfo.style}
                    </span>
                  )}
                  {buildingInfo.architect && buildingInfo.architect !== "Unknown" && (
                    <span className="flex items-center gap-1 text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                      <User className="w-3 h-3" />
                      {buildingInfo.architect}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setBuildingInfo(null)}
                className="text-white/40 hover:text-white p-1 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-white/80 leading-relaxed mb-4">{buildingInfo.history}</p>

            {buildingInfo.funFact && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Fun Fact
                </div>
                <p className="text-sm text-amber-100/80">{buildingInfo.funFact}</p>
              </div>
            )}

            <button
              onClick={() => setBuildingInfo(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              Scan Another Building
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected listing detail */}
      <AnimatePresence>
        {selectedListing && !buildingInfo && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl p-4 max-h-[50vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">{selectedListing.title}</h3>
                <p className="text-xs text-white/50 mt-0.5">{selectedListing.address}</p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-white/40 hover:text-white text-xl leading-none p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedListing.images[0] && (
              <img
                src={selectedListing.images[0]}
                alt={selectedListing.title}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
            )}

            <p className="text-sm text-white/70 mb-3">{selectedListing.description}</p>

            <div className="flex items-center gap-4 text-sm mb-3">
              <span className="font-bold text-white">
                ${selectedListing.price}
                <span className="font-normal text-white/50">/{selectedListing.priceUnit}</span>
              </span>
              {selectedListing.rating && (
                <span className="flex items-center gap-1 text-white/60">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {selectedListing.rating}
                </span>
              )}
              <span className="text-white/40 capitalize">{selectedListing.source}</span>
            </div>

            <a
              href={selectedListing.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              View on {selectedListing.source.charAt(0).toUpperCase() + selectedListing.source.slice(1)}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}
