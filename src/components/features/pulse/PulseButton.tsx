"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface PulseButtonProps {
  onClick: () => void;
}

export default function PulseButton({ onClick }: PulseButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring", damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
    >
      <div className="relative">
        <Activity className="w-5 h-5" />
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-400"
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <span className="text-sm font-semibold">Pulse</span>
    </motion.button>
  );
}
