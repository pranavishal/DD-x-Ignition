"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Clock, MapPin, Loader2 } from "lucide-react";
import { Building, StoryScene } from "../../types";

interface PanelProps {
  building: Building | null;
  onClose: () => void;
  onPlayStory: (scenes: StoryScene[], audioUrl?: string) => void;
}

export default function Panel({ building, onClose, onPlayStory }: PanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const handleGenerate = async () => {
    if (!building) return;
    
    setIsGenerating(true);
    setLoadingStep("Scanning coordinates...");

    try {
      // Step 1: Call our new API route
      setTimeout(() => setLoadingStep("Searching municipal archives..."), 2000);
      setTimeout(() => setLoadingStep("Synthesizing historical timeline..."), 4000);
      setTimeout(() => setLoadingStep("Restoring archival photographs..."), 6000);
      setTimeout(() => setLoadingStep("Recording voiceover narration..."), 8000);

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: building.name,
          lat: building.coordinates.lat,
          lng: building.coordinates.lng,
          type: building.originalUse,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate story');

      const data = await response.json();
      
      // Step 2: Pass the generated scenes back up to play the modal
      setIsGenerating(false);
      onPlayStory(data.storyScenes, data.audioUrl);

    } catch (error) {
      console.error("Story generation failed:", error);
      setIsGenerating(false);
      // Fallback: If API fails, play the hardcoded scenes so the demo doesn't crash
      onPlayStory(building.storyScenes, building.audioUrl);
    }
  };

  return (
    <AnimatePresence>
      {building && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto border-l border-gray-200"
        >
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="mt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{building.name}</h2>
              <div className="flex items-center text-gray-500 mb-6">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{building.address}</span>
              </div>

              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                {building.summary}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Built</p>
                  <p className="font-medium text-gray-900">{building.yearBuilt}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Original Use</p>
                  <p className="font-medium text-gray-900">{building.originalUse}</p>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-black text-white rounded-xl py-4 px-6 font-semibold flex flex-col items-center justify-center space-y-2 hover:bg-gray-800 transition-colors disabled:opacity-70 relative overflow-hidden"
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="flex items-center space-x-2 mb-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uncovering History...</span>
                    </div>
                    <motion.div 
                      key={loadingStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-gray-400 font-mono"
                    >
                      {loadingStep}
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Story</span>
                  </div>
                )}
              </button>

              <div className="mt-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
                <div className="space-y-6">
                  {building.timelineEvents.map((event, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-gray-200">
                      <div className="absolute w-3 h-3 bg-black rounded-full -left-[7px] top-1.5" />
                      <p className="text-sm font-bold text-gray-500 mb-1">{event.year}</p>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h4>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
