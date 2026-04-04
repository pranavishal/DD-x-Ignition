"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import type { Building } from "@/types";

type TruthTab = "social" | "historical" | "physical";

interface VastuPanelProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateStory: () => void;
  isGeneratingStory: boolean;
  onPlayStory: (scenes: any[], audioUrl?: string) => void;
}

export default function VastuPanel({
  building,
  isOpen,
  onClose,
  onGenerateStory,
  isGeneratingStory,
  onPlayStory,
}: VastuPanelProps) {
  const [activeSection, setActiveSection] = useState<TruthTab>("social");

  if (!building) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 z-[1000] h-full w-[380px]
                     border-l border-cyan-900/30 bg-[#0b0b12]/95
                     backdrop-blur-xl overflow-y-auto pb-20"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0b0b12]/80 backdrop-blur p-4
                          border-b border-cyan-900/20">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 p-1 text-gray-500
                         hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-semibold text-white pr-8 leading-tight">
              {building.name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{building.address}</p>

            {/* Quick stats */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <StatPill label="Height" value={building.height ? `${building.height}m` : `${building.coordinates.height ? Math.round(building.coordinates.height) : "?"}m`} />
              <StatPill label="Built" value={building.yearBuilt !== "Unknown" ? building.yearBuilt : "—"} />
              <StatPill label="Use" value={building.currentUse.split("/")[0].trim()} />
            </div>
          </div>

          {/* Truth tab selector */}
          <div className="flex border-b border-cyan-900/20">
            {(["social", "historical", "physical"] as TruthTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-wider
                            transition-colors border-b-2
                            ${activeSection === tab
                              ? "border-cyan-400 text-cyan-400"
                              : "border-transparent text-gray-500 hover:text-gray-300"}`}
              >
                {tab === "social"     && "💰 Social"}
                {tab === "historical" && "👻 History"}
                {tab === "physical"   && "🫁 Physical"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4">
            {activeSection === "social"     && <SocialSection building={building} />}
            {activeSection === "historical" && (
              <HistoricalSection
                building={building}
                onGenerate={onGenerateStory}
                isGenerating={isGeneratingStory}
                onPlayStory={onPlayStory}
              />
            )}
            {activeSection === "physical"   && <PhysicalSection building={building} />}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-cyan-950/30 px-2.5 py-1.5 border border-cyan-900/20 text-xs">
      <span className="text-gray-500">{label} </span>
      <span className="text-cyan-300 font-mono">{value}</span>
    </div>
  );
}

function SocialSection({ building }: { building: Building }) {
  const rental = building.rentalData;

  if (!rental || rental.totalUnits === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-3">🏛️</p>
        <p className="text-gray-400 text-sm">No rental units — this is a public landmark.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-cyan-950/20 border border-cyan-900/20 p-4">
        <p className="text-3xl font-bold text-cyan-300 font-mono">
          ${rental.avgPrice.toLocaleString()}
          <span className="text-sm text-gray-400 font-sans ml-1">/mo avg</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {rental.availableUnits} of {rental.totalUnits} units available
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Price / sqft" value={`$${rental.pricePerSqft}`} />
        <MetricCard label="Vacancy" value={`${rental.vacancyRate}%`} />
      </div>

      {/* Availability bar */}
      <div className="rounded-lg bg-gray-900/50 border border-gray-800 p-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400">Unit availability</span>
          <span className="text-cyan-300 font-mono">
            {rental.availableUnits}/{rental.totalUnits}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-700"
            style={{ width: `${(rental.availableUnits / rental.totalUnits) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function HistoricalSection({
  building,
  onGenerate,
  isGenerating,
  onPlayStory,
}: {
  building: Building;
  onGenerate: () => void;
  isGenerating: boolean;
  onPlayStory: (scenes: any[], audioUrl?: string) => void;
}) {
  // Show timeline if it exists
  const hasTimeline = building.timelineEvents.length > 0;
  const hasStory = building.storyScenes && building.storyScenes.length > 0;

  return (
    <div className="space-y-4">
      {/* Timeline */}
      {hasTimeline && (
        <div className="space-y-3">
          {building.timelineEvents.map((event, i) => (
            <div key={i} className="relative pl-5 border-l border-cyan-900/40">
              <div className="absolute w-2 h-2 bg-cyan-500 rounded-full -left-[5px] top-1.5" />
              <p className="text-[10px] font-bold text-cyan-600 mb-0.5 font-mono">
                {event.year}
              </p>
              <h4 className="text-sm font-semibold text-white mb-0.5">{event.title}</h4>
              <p className="text-xs text-gray-400">{event.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ghost story section */}
      {hasStory ? (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-purple-500">AI Ghost Narrative</p>
          {building.storyScenes.slice(0, 2).map((scene, i) => (
            <div key={i} className="rounded-lg bg-purple-950/20 border border-purple-900/20 p-3">
              {scene.imageUrl && (
                <img
                  src={scene.imageUrl}
                  alt=""
                  className="rounded mb-2 w-full h-28 object-cover"
                />
              )}
              <p className="text-xs text-gray-300 leading-relaxed">{scene.text}</p>
            </div>
          ))}
          <button
            onClick={() => onPlayStory(building.storyScenes, building.audioUrl)}
            className="w-full rounded-lg bg-purple-900/30 border border-purple-800/30
                       py-2 text-xs text-purple-300 hover:bg-purple-900/50 transition-colors"
          >
            ▶ Play full story
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-4">
            Uncover this building&apos;s hidden history
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-2.5
                       text-sm font-medium text-white transition-all hover:scale-105
                       disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 mx-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Channeling the past...
              </>
            ) : (
              <>👻 Generate Ghost Story</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function PhysicalSection({ building }: { building: Building }) {
  const safety = building.safetyData;

  if (!safety) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-3">📡</p>
        <p className="text-gray-400 text-sm">No environmental data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RiskBar
        label="Radon Risk"
        value={safety.radonPciL}
        max={8}
        unit=" pCi/L"
        thresholds={[2, 4]}
        invert={false}
        hint="Safe < 2 · Elevated > 4"
      />
      <RiskBar
        label="Noise Level"
        value={safety.noiseDb}
        max={90}
        unit=" dB"
        thresholds={[55, 70]}
        invert={false}
        hint="Quiet < 55 · Loud > 70"
      />
      <RiskBar
        label="Walkability"
        value={safety.walkability}
        max={100}
        unit="/100"
        thresholds={[40, 70]}
        invert={true}
        hint="Car-dependent < 40 · Walker's paradise > 90"
      />
      <RiskBar
        label="Crime Index"
        value={safety.crimeIndex}
        max={100}
        unit="/100"
        thresholds={[30, 60]}
        invert={false}
        hint="Safe < 30 · High-risk > 60"
      />
    </div>
  );
}

function RiskBar({
  label,
  value,
  max,
  unit,
  thresholds,
  invert,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  thresholds: [number, number];
  invert: boolean;
  hint: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  const barColor = invert
    ? value >= thresholds[1]
      ? "bg-emerald-500"
      : value >= thresholds[0]
        ? "bg-amber-500"
        : "bg-red-500"
    : value <= thresholds[0]
      ? "bg-emerald-500"
      : value <= thresholds[1]
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="rounded-lg bg-gray-900/50 border border-gray-800 p-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-mono text-white">
          {value}{unit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-600 mt-1">{hint}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cyan-950/20 border border-cyan-900/20 p-2.5">
      <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-cyan-300 font-mono text-sm mt-0.5">{value}</p>
    </div>
  );
}
