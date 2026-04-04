"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { getStaticFeedItems } from "@/data/mockFeedItems";

interface NewsTickerProps {
  cityName: string;
}

export default function NewsTicker({ cityName }: NewsTickerProps) {
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    const items = getStaticFeedItems(cityName);
    setHeadlines(items.map((item) => `${item.title} — ${item.source}`));
  }, [cityName]);

  if (headlines.length === 0) return null;

  const tickerText = headlines.join("   •   ");

  return (
    <div className="relative overflow-hidden px-6 py-2 border-y border-white/5">
      <div className="flex items-center gap-3">
        <div className="shrink-0 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <motion.div
            className="whitespace-nowrap text-xs text-white/50"
            animate={{ x: [0, -(tickerText.length * 6)] }}
            transition={{
              duration: Math.max(20, tickerText.length * 0.15),
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {tickerText}   •   {tickerText}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
