"use client";

import { motion } from "framer-motion";
import { Calendar, Newspaper, MessageCircle, Zap } from "lucide-react";
import { PulseFeedItem } from "@/types";

const typeConfig: Record<
  PulseFeedItem["type"],
  { icon: typeof Calendar; color: string; label: string }
> = {
  event: { icon: Calendar, color: "text-blue-400 bg-blue-400/10", label: "Event" },
  news: { icon: Newspaper, color: "text-emerald-400 bg-emerald-400/10", label: "News" },
  social: { icon: MessageCircle, color: "text-pink-400 bg-pink-400/10", label: "Social" },
  "live-update": { icon: Zap, color: "text-yellow-400 bg-yellow-400/10", label: "Live" },
};

interface FeedItemCardProps {
  item: PulseFeedItem;
}

export default function FeedItemCard({ item }: FeedItemCardProps) {
  const config = typeConfig[item.type] || typeConfig.news;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
    >
      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-white/40">{item.timestamp}</span>
        </div>
        <h4 className="text-white text-sm font-semibold mb-0.5 truncate">{item.title}</h4>
        <p className="text-white/50 text-xs line-clamp-2">{item.description}</p>
        <p className="text-white/30 text-xs mt-1">via {item.source}</p>
      </div>
    </motion.div>
  );
}
