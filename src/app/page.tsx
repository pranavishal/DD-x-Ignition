"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import LandingPage from "@/components/ui/LandingPage";
import TabNav, { TabId } from "@/components/ui/TabNav";

// CesiumJS uses window/document — must be client-side only, never SSR'd
const CesiumScene = dynamic(
  () => import("@/components/map/CesiumScene"),
  { ssr: false }
);

export default function Home() {
  const [exploreLocation, setExploreLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("map");

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a0f]">
      <AnimatePresence mode="wait">
        {!exploreLocation ? (
          // ── Landing / Search ──────────────────────────────────────────────
          <LandingPage key="landing" onLocationSelect={setExploreLocation} />
        ) : (
          // ── Main App with Tab Navigation ─────────────────────────────────
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {/* Location header — visible on all tabs */}
            <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10
                            flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow-lg">
                  {exploreLocation.name}
                </h1>
                {activeTab === "map" && (
                  <p className="text-xs text-white/70 mt-0.5 bg-black/40 inline-block
                                px-2.5 py-1 rounded-full backdrop-blur-sm">
                    Click any building to explore
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setExploreLocation(null);
                  setActiveTab("map");
                }}
                className="pointer-events-auto bg-white/10 hover:bg-white/20
                           border border-white/20 text-white px-3 py-1.5
                           rounded-full backdrop-blur-md transition-colors
                           text-xs font-medium"
              >
                Change Location
              </button>
            </div>

            {/* ── MAP TAB (Engineer 1) ──────────────────────────────────── */}
            {/*
              Using block/hidden rather than conditional rendering so the Cesium
              viewer stays mounted when switching tabs — remounting is expensive
              and causes a flash.
            */}
            <div className={`absolute inset-0 ${activeTab === "map" ? "block" : "hidden"}`}>
              <CesiumScene targetLocation={exploreLocation} />
            </div>

            {/* ── JOURNEYS TAB (Engineer 2) ─────────────────────────────── */}
            <div
              className={`absolute inset-0 flex items-center justify-center
                          ${activeTab === "journeys" ? "block" : "hidden"}`}
            >
              <div
                id="journeys-root"
                className="flex h-full w-full items-center justify-center
                           text-gray-500 text-sm"
              >
                Journeys — Engineer 2
              </div>
            </div>

            {/* ── RENTALS TAB (Engineer 3) ──────────────────────────────── */}
            <div
              className={`absolute inset-0 ${activeTab === "rentals" ? "block" : "hidden"}`}
            >
              <div
                id="rentals-root"
                className="flex h-full w-full items-center justify-center
                           text-gray-500 text-sm"
              >
                Rentals — Engineer 3
              </div>
            </div>

            {/* ── PULSE TAB (Engineer 4) ────────────────────────────────── */}
            <div
              className={`absolute inset-0 ${activeTab === "pulse" ? "block" : "hidden"}`}
            >
              <div
                id="pulse-root"
                className="flex h-full w-full items-center justify-center
                           text-gray-500 text-sm"
              >
                Pulse — Engineer 4
              </div>
            </div>

            {/* ── Shared Tab Bar ────────────────────────────────────────── */}
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
