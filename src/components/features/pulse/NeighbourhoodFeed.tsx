"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { PulseFeedItem } from "@/types";
import { getStaticFeedItems } from "@/data/mockFeedItems";
import FeedItemCard from "./FeedItemCard";

interface NeighbourhoodFeedProps {
  cityName: string;
}

export default function NeighbourhoodFeed({ cityName }: NeighbourhoodFeedProps) {
  const [items, setItems] = useState<PulseFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Load static items on mount
  useEffect(() => {
    setItems(getStaticFeedItems(cityName));
    setIsAiGenerated(false);
  }, [cityName]);

  const refreshWithAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pulse-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setItems(data.items);
      setIsAiGenerated(true);
    } catch (error) {
      console.error("AI feed refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Refresh with AI Button */}
      <motion.button
        onClick={refreshWithAI}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white/80 hover:text-white transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Generating local pulse...</span>
          </>
        ) : (
          <>
            {isAiGenerated ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isAiGenerated ? "Refresh with AI" : "Generate Live Pulse with AI"}
            </span>
          </>
        )}
      </motion.button>

      {isAiGenerated && (
        <p className="text-xs text-purple-400/60 text-center">
          AI-generated content for {cityName}
        </p>
      )}

      {/* Feed Items */}
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {items.map((item) => (
          <FeedItemCard key={item.id} item={item} />
        ))}
      </motion.div>
    </div>
  );
}
