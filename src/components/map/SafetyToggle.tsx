"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HeatmapLayerId } from "@/types";

interface SafetyToggleProps {
  onToggle: (layerId: HeatmapLayerId, enabled: boolean) => void;
}

const LAYERS: {
  id: HeatmapLayerId;
  label: string;
  icon: string;
  description: string;
}[] = [
  { id: "walkability", label: "Walkability", icon: "🚶", description: "Green = walkable · Red = car-dependent" },
  { id: "noise",       label: "Noise",       icon: "🔊", description: "Blue = quiet · Red = loud" },
  { id: "crime",       label: "Crime",       icon: "🛡️", description: "Green = safe · Red = high-risk" },
  { id: "radon",       label: "Radon",       icon: "☢️",  description: "Cyan = safe · Orange = elevated" },
];

export default function SafetyToggle({ onToggle }: SafetyToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState<Record<HeatmapLayerId, boolean>>({
    walkability: false,
    noise: false,
    crime: false,
    radon: false,
  });

  const handleToggle = (id: HeatmapLayerId) => {
    const newVal = !enabledLayers[id];
    setEnabledLayers((prev) => ({ ...prev, [id]: newVal }));
    onToggle(id, newVal);
  };

  const activeCount = Object.values(enabledLayers).filter(Boolean).length;

  return (
    <div className="fixed bottom-20 left-4 z-[1000]">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 rounded-lg bg-[#0b0b12]/90 border
                   border-cyan-900/30 px-3 py-2 text-sm text-cyan-400
                   backdrop-blur-xl hover:border-cyan-700/50 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-base">🔬</span>
        <span className="font-medium">Safety X-Ray</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-cyan-500 text-[#0a0a0f] text-[10px]
                           font-bold px-1.5 py-0.5 font-mono">
            {activeCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mt-2 w-64 rounded-lg bg-[#0b0b12]/95 border border-cyan-900/30
                       p-3 backdrop-blur-xl space-y-1"
          >
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">
              Digital X-Ray Overlays
            </p>
            {LAYERS.map((layer) => {
              const active = enabledLayers[layer.id];
              return (
                <button
                  key={layer.id}
                  onClick={() => handleToggle(layer.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2
                              text-left transition-all
                              ${active
                                ? "bg-cyan-950/40 border border-cyan-800/30"
                                : "hover:bg-gray-800/30 border border-transparent"}`}
                >
                  <span className="text-base">{layer.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${active ? "text-cyan-300" : "text-gray-400"}`}>
                      {layer.label}
                    </p>
                    <p className="text-[10px] text-gray-600 truncate">{layer.description}</p>
                  </div>
                  {/* Toggle pill */}
                  <div
                    className={`relative h-4 w-7 rounded-full transition-colors flex-shrink-0
                                ${active ? "bg-cyan-500" : "bg-gray-700"}`}
                  >
                    <div
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white
                                  transition-transform
                                  ${active ? "translate-x-3.5" : "translate-x-0.5"}`}
                    />
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
