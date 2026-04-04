"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CesiumScene from "@/components/map/CesiumScene";
import Panel from "@/components/ui/Panel";
import StoryModal from "@/components/ui/StoryModal";
import LandingPage from "@/components/ui/LandingPage";
import JourneyPlayer from "@/components/features/JourneyPlayer";
import JourneyRoutePreview from "@/components/features/JourneyRoutePreview";
import PulseButton from "@/components/features/pulse/PulseButton";
import PulseOverlay from "@/components/features/pulse/PulseOverlay";
import CouponCelebration from "@/components/features/pulse/CouponCelebration";
import { Building, StoryScene, UniqueSpot, JourneyData } from "@/types";
import { getSeedSpots } from "@/data/mockSpots";
import { getRandomProfile } from "@/data/mockProfiles";
import { Loader2, Compass } from "lucide-react";

export default function Home() {
  const [exploreLocation, setExploreLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [activeStoryScenes, setActiveStoryScenes] = useState<StoryScene[]>([]);

  // Journey state
  const [journeyLocation, setJourneyLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [isJourneyLoading, setIsJourneyLoading] = useState(false);
  const [isRoutePreview, setIsRoutePreview] = useState(false);
  const cesiumViewerRef = useRef<any>(null);

  // Pulse state
  const [isPulseOpen, setIsPulseOpen] = useState(false);
  const [spots, setSpots] = useState<UniqueSpot[]>([]);
  const [celebratingSpot, setCelebratingSpot] = useState<UniqueSpot | null>(null);
  const [isFetchingSpots, setIsFetchingSpots] = useState(false);

  // Fetch real nearby places when location changes
  useEffect(() => {
    if (!exploreLocation) return;

    const fetchNearbySpots = async () => {
      setIsFetchingSpots(true);
      try {
        const res = await fetch("/api/nearby-places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: exploreLocation.lat, lng: exploreLocation.lng }),
        });
        const data = await res.json();
        const spotsWithProfiles: UniqueSpot[] = data.spots.map((spot: Omit<UniqueSpot, "submittedBy"> & { submittedBy?: UniqueSpot["submittedBy"] }) => ({
          ...spot,
          submittedBy: spot.submittedBy || getRandomProfile(),
        }));
        setSpots(spotsWithProfiles);
      } catch {
        setSpots(getSeedSpots(exploreLocation.name));
      } finally {
        setIsFetchingSpots(false);
      }
    };

    fetchNearbySpots();
  }, [exploreLocation]);

  // Fetch journey data when a journey is triggered
  useEffect(() => {
    if (!journeyLocation) return;

    const fetchJourney = async () => {
      setIsJourneyLoading(true);
      try {
        const res = await fetch("/api/generate-journey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cityName: journeyLocation.name,
            lat: journeyLocation.lat,
            lng: journeyLocation.lng,
          }),
        });
        if (!res.ok) throw new Error("Journey generation failed");
        const data = await res.json();
        setJourneyData(data);
        setIsRoutePreview(true);
      } catch (err) {
        console.error("Journey generation failed:", err);
        setJourneyLocation(null);
        setIsRoutePreview(false);
      } finally {
        setIsJourneyLoading(false);
      }
    };

    fetchJourney();
  }, [journeyLocation]);

  const handleViewerReady = useCallback((viewer: any) => {
    cesiumViewerRef.current = viewer;
  }, []);

  const handleJourneyEnd = useCallback(() => {
    setJourneyData(null);
    setJourneyLocation(null);
    setIsRoutePreview(false);
  }, []);

  const handlePreviewStart = useCallback(() => {
    setIsRoutePreview(false);
  }, []);

  const handlePreviewCancel = useCallback(() => {
    setJourneyData(null);
    setJourneyLocation(null);
    setIsRoutePreview(false);
  }, []);

  const handleLikeSpot = useCallback((id: string) => {
    setSpots((prev) =>
      prev.map((spot) => {
        if (spot.id !== id) return spot;
        const newLikes = spot.likes + 1;
        const justUnlocked = newLikes >= 50 && !spot.couponUnlocked;
        const updated = {
          ...spot,
          likes: newLikes,
          couponUnlocked: spot.couponUnlocked || newLikes >= 50,
        };
        if (justUnlocked) {
          setCelebratingSpot(updated);
        }
        return updated;
      })
    );
  }, []);

  const handleAddSpot = useCallback((spot: UniqueSpot) => {
    setSpots((prev) => [spot, ...prev]);
  }, []);

  const handleDismissCelebration = useCallback(() => {
    setCelebratingSpot(null);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {!exploreLocation ? (
          <LandingPage
            key="landing"
            onLocationSelect={setExploreLocation}
            onJourneySelect={(loc) => {
              setJourneyLocation(loc);
              setExploreLocation(loc);
            }}
          />
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {/* 3D Map Background */}
            <CesiumScene
              targetLocation={exploreLocation}
              onBuildingSelect={(building) => setSelectedBuilding(building)}
              onViewerReady={handleViewerReady}
            />

            {/* Small Header Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10 flex justify-between items-start">
              <div className="max-w-md">
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-1">
                  {exploreLocation.name}
                </h1>
                <p className="text-sm text-white/90 drop-shadow-md bg-black/40 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                  Click any building to uncover its story.
                </p>
              </div>

              <button
                onClick={() => {
                  setExploreLocation(null);
                  setSelectedBuilding(null);
                  setIsPulseOpen(false);
                  setJourneyData(null);
                  setJourneyLocation(null);
                  setIsRoutePreview(false);
                }}
                className="pointer-events-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md transition-colors text-sm font-medium"
              >
                Change Location
              </button>
            </div>

            {/* Slide-out Panel */}
            <Panel
              building={selectedBuilding}
              onClose={() => setSelectedBuilding(null)}
              onPlayStory={(scenes) => {
                setActiveStoryScenes(scenes);
                setIsStoryPlaying(true);
              }}
            />

            {/* Full Screen Story Modal */}
            <AnimatePresence>
              {isStoryPlaying && selectedBuilding && (
                <StoryModal
                  building={{ ...selectedBuilding, storyScenes: activeStoryScenes }}
                  onClose={() => setIsStoryPlaying(false)}
                />
              )}
            </AnimatePresence>

            {/* Pulse Button */}
            {!isPulseOpen && (
              <PulseButton onClick={() => setIsPulseOpen(true)} />
            )}

            {/* Pulse Overlay */}
            <AnimatePresence>
              {isPulseOpen && (
                <PulseOverlay
                  isOpen={isPulseOpen}
                  onClose={() => setIsPulseOpen(false)}
                  spots={spots}
                  onLikeSpot={handleLikeSpot}
                  onAddSpot={handleAddSpot}
                  cityName={exploreLocation.name}
                  defaultCoords={{ lat: exploreLocation.lat, lng: exploreLocation.lng }}
                  isLoading={isFetchingSpots}
                />
              )}
            </AnimatePresence>

            {/* Coupon Celebration */}
            <AnimatePresence>
              {celebratingSpot && (
                <CouponCelebration
                  spot={celebratingSpot}
                  onDismiss={handleDismissCelebration}
                />
              )}
            </AnimatePresence>

            {/* Journey loading screen */}
            <AnimatePresence>
              {isJourneyLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
                >
                  <Compass className="w-12 h-12 text-indigo-400 mb-4 animate-spin" style={{ animationDuration: "3s" }} />
                  <p className="text-white text-xl font-semibold mb-2">
                    Preparing your journey...
                  </p>
                  <p className="text-white/50 text-sm">
                    Discovering landmarks and recording narration
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Journey Route Preview */}
            <AnimatePresence>
              {journeyData && cesiumViewerRef.current && !isJourneyLoading && isRoutePreview && (
                <JourneyRoutePreview
                  journeyData={journeyData}
                  viewer={cesiumViewerRef.current}
                  onStart={handlePreviewStart}
                  onCancel={handlePreviewCancel}
                  onLandmarkClick={(building) => setSelectedBuilding(building)}
                />
              )}
            </AnimatePresence>

            {/* Journey Player */}
            <AnimatePresence>
              {journeyData && cesiumViewerRef.current && !isJourneyLoading && !isRoutePreview && (
                <JourneyPlayer
                  journeyData={journeyData}
                  viewer={cesiumViewerRef.current}
                  onEnd={handleJourneyEnd}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
