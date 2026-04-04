"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  MapPin,
  Globe as GlobeIcon,
  MousePointer,
  BookOpen,
  Compass,
} from "lucide-react";

const CobeGlobe = dynamic(() => import("@/components/Globe"), { ssr: false });

interface LandingPageProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
  onJourneySelect: (location: { lat: number; lng: number; name: string }) => void;
}

const CITY_CHIPS = [
  { label: "Toronto", query: "Toronto, ON, Canada" },
  { label: "New York", query: "New York City, NY, USA" },
];

const STEPS = [
  {
    icon: GlobeIcon,
    title: "Explore",
    description: "Fly into any city in stunning 3D",
  },
  {
    icon: MousePointer,
    title: "Tap",
    description: "Select any building to reveal its plaque",
  },
  {
    icon: BookOpen,
    title: "Discover",
    description: "AI uncovers its history with photos and narration",
  },
];

export default function LandingPage({ onLocationSelect, onJourneySelect }: LandingPageProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ description: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isJourneyLoading, setIsJourneyLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.predictions) {
          setSuggestions(data.predictions);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = async (address: string) => {
    setIsSearching(true);
    setShowDropdown(false);
    setQuery(address);

    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (data.lat && data.lng) {
        onLocationSelect({ lat: data.lat, lng: data.lng, name: data.name });
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching for location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelectLocation(query);
    }
  };

  const handleJourneyFor = async (address: string) => {
    setIsJourneyLoading(true);
    setShowDropdown(false);
    setQuery(address);

    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (data.lat && data.lng) {
        onJourneySelect({ lat: data.lat, lng: data.lng, name: data.name });
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching for location.");
    } finally {
      setIsJourneyLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 z-50 bg-white text-black overflow-y-auto"
    >
      {/* Fixed centered globe */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[1]">
        <div className="w-[800px] h-[800px] pointer-events-auto">
          <CobeGlobe className="w-full aspect-square" />
        </div>
      </div>

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center max-w-2xl"
        >
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            style={{ textShadow: "0 0 10px white, 0 0 20px white, 0 0 40px white, 0 0 60px white, 0 0 80px white" }}
          >
            Urban Marble
          </h1>
          <p
            className="text-lg text-gray-500 mb-2"
            style={{ textShadow: "0 0 10px white, 0 0 20px white, 0 0 40px white, 0 0 60px white, 0 0 80px white" }}
          >
            Every building has a story. We make it visible.
          </p>
        </motion.div>
      </section>

      {/* ===== SECTION 2: SEARCH ===== */}
      <section className="relative z-10 min-h-[60vh] flex flex-col items-center justify-center px-6 py-20">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm text-black/40 uppercase tracking-widest font-medium mb-6"
        >
          Start exploring
        </motion.p>

        <div className="w-full max-w-2xl relative" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative group z-20">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-black transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (query.trim()) setShowDropdown(true);
              }}
              placeholder="Search for a city, landmark, or address..."
              className={`w-full bg-black/5 border border-black/15 text-black placeholder-gray-400 py-5 pl-14 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-black/20 focus:bg-black/8 transition-all backdrop-blur-md ${
                showDropdown && (suggestions.length > 0 || query.trim())
                  ? "rounded-t-2xl border-b-0"
                  : "rounded-2xl"
              }`}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="bg-black hover:bg-gray-800 disabled:bg-black/30 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Explore"}
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showDropdown && query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border border-black/15 border-t-0 rounded-b-2xl overflow-hidden z-10 shadow-2xl"
              >
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-center border-b border-black/5 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectLocation(suggestion.description)}
                          className="flex-1 text-left px-6 py-4 hover:bg-black/5 transition-colors flex items-center space-x-3 min-w-0"
                        >
                          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{suggestion.description}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleJourneyFor(suggestion.description)}
                          disabled={isJourneyLoading}
                          title={`Take me on a journey to ${suggestion.description}`}
                          className="group flex-shrink-0 flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isJourneyLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-500" />
                          )}
                          Journey
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-gray-400 text-sm italic">
                      {isSearching ? "Searching..." : "Type to search..."}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* City Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 justify-center mt-6"
        >
          {CITY_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSelectLocation(chip.query)}
              disabled={isSearching}
              className="bg-black/5 hover:bg-black/10 border border-black/10 rounded-full px-4 py-2 text-sm text-black/60 hover:text-black transition-colors disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ===== SECTION 3: HOW IT WORKS ===== */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-black/40 uppercase tracking-widest font-medium mb-12"
        >
          How it works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.15 }}
              className="bg-black/5 border border-black/10 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-black font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-black/50 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-20" />
    </motion.div>
  );
}
