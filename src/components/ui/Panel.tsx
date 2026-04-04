"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Clock, MapPin, Loader2 } from "lucide-react";
import { Building, StoryScene } from "../../types";

interface EnrichmentData {
  name: string;
  address: string;
  yearBuilt: string;
  architecturalStyle: string;
  summary: string;
  originalUse: string;
  currentUse: string;
  timelineEvents: { year: string; title: string; description: string }[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

interface PanelProps {
  building: Building | null;
  onClose: () => void;
  onPlayStory: (scenes: StoryScene[]) => void;
}

export default function Panel({ building, onClose, onPlayStory }: PanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const streetViewUrl = building
    ? `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${building.coordinates.lat},${building.coordinates.lng}&fov=90&heading=235&pitch=10&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null;

  useEffect(() => {
    if (!building) {
      setEnrichment(null);
      setIsEnriching(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsEnriching(true);
    setEnrichment(null);

    fetch("/api/enrich-building", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: building.name,
        lat: building.coordinates.lat,
        lng: building.coordinates.lng,
        type: building.originalUse,
        height: building.coordinates.height,
        searchLocation: building.address,
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Enrichment failed");
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setEnrichment(data);
          setIsEnriching(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Enrichment failed:", err);
          setIsEnriching(false);
        }
      });

    return () => controller.abort();
  }, [building]);

  const handleGenerate = async () => {
    if (!building) return;
    setIsGenerating(true);
    setLoadingStep("Scanning coordinates...");

    try {
      setTimeout(() => setLoadingStep("Searching municipal archives..."), 2000);
      setTimeout(() => setLoadingStep("Synthesizing historical timeline..."), 4000);
      setTimeout(() => setLoadingStep("Restoring archival photographs..."), 6000);
      setTimeout(() => setLoadingStep("Recording voiceover narration..."), 8000);

      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enrichment?.name || building.name,
          lat: building.coordinates.lat,
          lng: building.coordinates.lng,
          type: enrichment?.currentUse || building.originalUse,
          context: enrichment
            ? `Built in ${enrichment.yearBuilt}. ${enrichment.architecturalStyle} style. ${enrichment.summary}`
            : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate story");
      const data = await response.json();
      setIsGenerating(false);
      onPlayStory(data.storyScenes);
    } catch (error) {
      console.error("Story generation failed:", error);
      setIsGenerating(false);
      onPlayStory(building.storyScenes);
    }
  };

  const isLoading = isEnriching && !enrichment;
  const displayName = enrichment?.name || building?.name || "";
  const displayAddress = enrichment?.address || building?.address || "";
  const displaySummary = enrichment?.summary || building?.summary || "";
  const displayYearBuilt = enrichment?.yearBuilt || building?.yearBuilt || "Unknown";
  const displayStyle = enrichment?.architecturalStyle || "";
  const displayOriginalUse = enrichment?.originalUse || building?.originalUse || "";
  const displayCurrentUse = enrichment?.currentUse || building?.currentUse || "";
  const displayTimeline = enrichment?.timelineEvents || building?.timelineEvents || [];

  return (
    <AnimatePresence>
      {building && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto border-l border-gray-200"
        >
          {/* Street View Hero */}
          <div className="relative h-52 w-full bg-gray-900 overflow-hidden">
            {streetViewUrl && (
              <motion.img
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={streetViewUrl}
                alt="Street view"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Building name overlaid on hero image */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={displayName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-2xl font-bold text-white drop-shadow-lg leading-tight"
                >
                  {displayName}
                </motion.h2>
              </AnimatePresence>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Address */}
            <div className="flex items-center text-gray-500 mb-5">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              {isLoading ? (
                <Skeleton className="h-4 w-52" />
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm truncate"
                >
                  {displayAddress}
                </motion.span>
              )}
            </div>

            {/* Summary */}
            <div className="mb-6 min-h-[60px]">
              {isLoading ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-gray-700 text-[15px] leading-relaxed"
                >
                  {displaySummary}
                </motion.p>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-[72px] rounded-xl" />
                  <Skeleton className="h-[72px] rounded-xl" />
                  <Skeleton className="h-[72px] rounded-xl" />
                  <Skeleton className="h-[72px] rounded-xl" />
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-gray-50 p-3.5 rounded-xl border border-gray-100"
                  >
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">
                      Built
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {displayYearBuilt}
                    </p>
                  </motion.div>

                  {displayStyle && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gray-50 p-3.5 rounded-xl border border-gray-100"
                    >
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">
                        Style
                      </p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {displayStyle}
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gray-50 p-3.5 rounded-xl border border-gray-100"
                  >
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">
                      Original Use
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {displayOriginalUse}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 p-3.5 rounded-xl border border-gray-100"
                  >
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">
                      Current Use
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {displayCurrentUse}
                    </p>
                  </motion.div>
                </>
              )}
            </div>

            {/* Generate Story CTA */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-4 px-6 font-semibold flex flex-col items-center justify-center transition-all disabled:opacity-70 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center w-full gap-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uncovering History...</span>
                  </div>
                  <motion.div
                    key={loadingStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-indigo-200 font-mono"
                  >
                    {loadingStep}
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Full Story</span>
                </div>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              AI documentary with narration &amp; historical images
            </p>

            {/* Timeline */}
            <div className="mt-8 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                Timeline
              </h3>

              {isLoading ? (
                <div className="space-y-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="pl-6 border-l-2 border-gray-200 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : displayTimeline.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.08 } },
                  }}
                  className="space-y-5"
                >
                  {displayTimeline.map((event, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className="relative pl-6 border-l-2 border-indigo-200"
                    >
                      <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1" />
                      <p className="text-xs font-bold text-indigo-600 mb-0.5">
                        {event.year}
                      </p>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        {event.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  No timeline data available yet.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
