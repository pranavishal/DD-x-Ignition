"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, PartyPopper } from "lucide-react";
import { UniqueSpot } from "@/types";

interface CouponCelebrationProps {
  spot: UniqueSpot;
  onDismiss: () => void;
}

const PARTICLE_COUNT = 24;
const COLORS = ["#a855f7", "#3b82f6", "#f59e0b", "#ec4899", "#10b981", "#f43f5e"];

function Particle({ index }: { index: number }) {
  const angle = (360 / PARTICLE_COUNT) * index;
  const distance = 120 + Math.random() * 80;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const color = COLORS[index % COLORS.length];
  const size = 6 + Math.random() * 8;

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 1.5, delay: Math.random() * 0.3, ease: "easeOut" }}
      className="absolute rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

export default function CouponCelebration({ spot, onDismiss }: CouponCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative flex flex-col items-center text-center"
      >
        {/* Particles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </div>

        {/* Content */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="relative z-10 flex flex-col items-center gap-4 px-8 py-6 rounded-3xl bg-gradient-to-br from-purple-600/90 to-blue-600/90 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <PartyPopper className="w-8 h-8 text-yellow-300" />
            <Gift className="w-8 h-8 text-yellow-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Coupon Unlocked!</h2>
          <p className="text-white/80 text-sm max-w-xs">
            <span className="font-semibold text-yellow-300">{spot.name}</span> hit 50 likes!
          </p>
          <div className="px-4 py-2 rounded-full bg-yellow-400/20 border border-yellow-400/40">
            <p className="text-yellow-300 font-bold text-sm">20% off at Local Partner Co.</p>
          </div>
          <p className="text-white/40 text-xs mt-1">Tap to dismiss</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
