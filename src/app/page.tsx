"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CesiumScene from "@/components/map/CesiumScene";
import Panel from "@/components/ui/Panel";
import StoryModal from "@/components/ui/StoryModal";
import LandingPage from "@/components/ui/LandingPage";
import { Building, StoryScene } from "@/types";

export default function Home() {
  const [exploreLocation, setExploreLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [activeStoryScenes, setActiveStoryScenes] = useState<StoryScene[]>([]);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | undefined>(undefined);

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
              onPlayStory={(scenes, audioUrl) => {
                setActiveStoryScenes(scenes);
                setActiveAudioUrl(audioUrl);
                setIsStoryPlaying(true);
              }}
            />

            {/* Full Screen Story Modal */}
            <AnimatePresence>
              {isStoryPlaying && selectedBuilding && (
                <StoryModal 
                  building={{ ...selectedBuilding, storyScenes: activeStoryScenes, audioUrl: activeAudioUrl }} 
                  onClose={() => setIsStoryPlaying(false)} 
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
