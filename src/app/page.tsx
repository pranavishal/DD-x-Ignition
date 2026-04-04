"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CesiumScene from "@/components/map/CesiumScene";
import Panel from "@/components/ui/Panel";
import StoryModal from "@/components/ui/StoryModal";
import LandingPage from "@/components/ui/LandingPage";
import PulseButton from "@/components/features/pulse/PulseButton";
import PulseOverlay from "@/components/features/pulse/PulseOverlay";
import CouponCelebration from "@/components/features/pulse/CouponCelebration";
import { Building, StoryScene, UniqueSpot } from "@/types";
import { getSeedSpots } from "@/data/mockSpots";

export default function Home() {
  const [exploreLocation, setExploreLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [activeStoryScenes, setActiveStoryScenes] = useState<StoryScene[]>([]);

  // Pulse state
  const [isPulseOpen, setIsPulseOpen] = useState(false);
  const [spots, setSpots] = useState<UniqueSpot[]>([]);
  const [celebratingSpot, setCelebratingSpot] = useState<UniqueSpot | null>(null);

  // Seed spots when location changes
  useEffect(() => {
    if (exploreLocation) {
      setSpots(getSeedSpots(exploreLocation.name));
    }
  }, [exploreLocation]);

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
          <LandingPage key="landing" onLocationSelect={setExploreLocation} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
