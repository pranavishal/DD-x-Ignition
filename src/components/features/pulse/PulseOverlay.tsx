"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { UniqueSpot } from "@/types";
import WanderlustFeed from "./WanderlustFeed";
import NeighbourhoodFeed from "./NeighbourhoodFeed";
import NewsTicker from "./NewsTicker";
import AddSpotModal from "./AddSpotModal";

interface PulseOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  spots: UniqueSpot[];
  onLikeSpot: (id: string) => void;
  onAddSpot: (spot: UniqueSpot) => void;
  cityName: string;
  defaultCoords: { lat: number; lng: number };
}

export default function PulseOverlay({
  isOpen,
  onClose,
  spots,
  onLikeSpot,
  onAddSpot,
  cityName,
  defaultCoords,
}: PulseOverlayProps) {
  const [activeTab, setActiveTab] = useState<"community" | "feed">("community");
  const [showAddSpot, setShowAddSpot] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] flex flex-col bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-3xl"
    >
      {/* Drag Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/30" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-3">
        <h2 className="text-xl font-bold text-white">Pulse</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* News Ticker */}
      <NewsTicker cityName={cityName} />

      {/* Tab Toggle */}
      <div className="flex gap-2 px-6 py-3">
        <button
          onClick={() => setActiveTab("community")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "community"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Community
        </button>
        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "feed"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Feed
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === "community" ? (
          <WanderlustFeed
            spots={spots}
            onLike={onLikeSpot}
            onAddSpot={() => setShowAddSpot(true)}
          />
        ) : (
          <NeighbourhoodFeed cityName={cityName} />
        )}
      </div>

      {/* Add Spot Modal */}
      <AddSpotModal
        isOpen={showAddSpot}
        onClose={() => setShowAddSpot(false)}
        onSubmit={(spot) => {
          onAddSpot(spot);
          setShowAddSpot(false);
        }}
        defaultCoords={defaultCoords}
        cityName={cityName}
      />
    </motion.div>
  );
}
