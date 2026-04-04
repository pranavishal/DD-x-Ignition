"use client";

import { motion } from "framer-motion";
import { Globe, Compass, Home, Activity } from "lucide-react";

export type TabId = "map" | "journeys" | "rentals" | "pulse";

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "map",      label: "Map",      Icon: Globe },
  { id: "journeys", label: "Journeys", Icon: Compass },
  { id: "rentals",  label: "Rentals",  Icon: Home },
  { id: "pulse",    label: "Pulse",    Icon: Activity },
];

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] flex h-16
                 items-center justify-around border-t border-cyan-900/30
                 bg-[#0a0a0f]/90 backdrop-blur-xl"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative flex flex-col items-center gap-0.5 px-4 py-2
                        text-xs font-medium transition-colors
                        ${isActive ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute -top-px left-2 right-2 h-0.5 bg-cyan-400"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
