"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CesiumScene from "@/components/map/CesiumScene";
import Panel from "@/components/ui/Panel";
import StoryModal from "@/components/ui/StoryModal";
import { buildings } from "@/data/buildings";
import { Building, StoryScene } from "@/types";

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [activeStoryScenes, setActiveStoryScenes] = useState<StoryScene[]>([]);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | undefined>(undefined);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Map Background */}
      <CesiumScene 
        buildings={buildings} 
        onBuildingSelect={(building) => setSelectedBuilding(building)} 
      />

      {/* Hero Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
            Explore the hidden story of your city
          </h1>
          <p className="text-lg text-white/90 drop-shadow-md bg-black/20 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
            Click a highlighted building to uncover its story.
          </p>
        </div>
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
    </main>
  );
}
