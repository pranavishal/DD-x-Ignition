"use client";

import { motion } from "framer-motion";
import { Plus, Compass } from "lucide-react";
import { UniqueSpot } from "@/types";
import SpotCard from "./SpotCard";

interface WanderlustFeedProps {
  spots: UniqueSpot[];
  onLike: (id: string) => void;
  onAddSpot: () => void;
}

export default function WanderlustFeed({ spots, onLike, onAddSpot }: WanderlustFeedProps) {
  return (
    <div className="space-y-4">
      {/* Add Spot Button */}
      <motion.button
        onClick={onAddSpot}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add a Unique Spot</span>
      </motion.button>

      {/* Spot Cards */}
      <motion.div
        className="grid gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {spots
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .map((spot) => (
            <SpotCard key={spot.id} spot={spot} onLike={onLike} />
          ))}
      </motion.div>

      {/* Long-term Thinking Banner */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
        <Compass className="w-4 h-4 text-purple-400 shrink-0" />
        <p className="text-xs text-white/50">
          User-discovered spots power smarter Journey maps — every contribution makes the next adventure better.
        </p>
      </div>
    </div>
  );
}
