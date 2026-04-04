"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import StoryPlayer from "../features/StoryPlayer";
import { Building } from "../../types";

interface StoryModalProps {
  building: Building;
  onClose: () => void;
}

export default function StoryModal({ building, onClose }: StoryModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <StoryPlayer scenes={building.storyScenes} audioUrl={building.audioUrl} />
      </motion.div>
    </div>
  );
}
