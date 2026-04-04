"use client";

import { motion } from "framer-motion";
import { Heart, Gift } from "lucide-react";
import { UniqueSpot } from "@/types";

const categoryColors: Record<UniqueSpot["category"], string> = {
  food: "bg-amber-500/80",
  art: "bg-pink-500/80",
  nature: "bg-emerald-500/80",
  nightlife: "bg-violet-500/80",
  "hidden-gem": "bg-cyan-500/80",
  historic: "bg-orange-500/80",
};

const categoryLabels: Record<UniqueSpot["category"], string> = {
  food: "Food",
  art: "Art",
  nature: "Nature",
  nightlife: "Nightlife",
  "hidden-gem": "Hidden Gem",
  historic: "Historic",
};

interface SpotCardProps {
  spot: UniqueSpot;
  onLike: (id: string) => void;
}

export default function SpotCard({ spot, onLike }: SpotCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10"
    >
      {/* Photo */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={spot.photoUrl}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${categoryColors[spot.category]}`}>
          {categoryLabels[spot.category]}
        </div>
        {spot.couponUnlocked && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-yellow-500/90">
            <Gift className="w-3 h-3" />
            Coupon
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-base mb-1">{spot.name}</h3>
        <p className="text-white/60 text-sm line-clamp-2 mb-3">{spot.description}</p>

        {/* Like Row */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => onLike(spot.id)}
            whileTap={{ scale: 1.3 }}
            className="flex items-center gap-1.5 text-white/70 hover:text-red-400 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${spot.likes >= 50 ? "fill-red-400 text-red-400" : ""}`}
            />
            <span className="text-sm font-medium">{spot.likes}</span>
          </motion.button>

          {spot.likes >= 45 && !spot.couponUnlocked && (
            <span className="text-xs text-yellow-400/80 font-medium">
              {50 - spot.likes} likes to coupon!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
