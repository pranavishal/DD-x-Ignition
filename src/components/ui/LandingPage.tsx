"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Map as MapIcon, Compass, Loader2, MapPin } from "lucide-react";

interface LandingPageProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
}

export default function LandingPage({ onLocationSelect }: LandingPageProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MapIcon className="w-16 h-16 mb-6 text-blue-500 mx-auto opacity-80" />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Reimagine <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">History</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto">
            Explore the hidden stories of any building, anywhere in the world.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full relative"
          ref={dropdownRef}
        >
          <form onSubmit={handleSearchSubmit} className="relative group z-20">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
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
              className={`w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 py-5 pl-14 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 transition-all backdrop-blur-md ${showDropdown && (suggestions.length > 0 || query.trim()) ? 'rounded-t-2xl border-b-0' : 'rounded-2xl'}`}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center"
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
                className="absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-white/20 border-t-0 rounded-b-2xl overflow-hidden z-10 shadow-2xl"
              >
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectLocation(suggestion.description)}
                        className="w-full text-left px-6 py-4 hover:bg-white/10 transition-colors flex items-center space-x-3 border-b border-white/5 last:border-b-0"
                      >
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-200 truncate">{suggestion.description}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-gray-400 text-sm italic">
                      {isSearching ? "Searching..." : "Type to search..."}
                    </div>
                  )}
                </div>
                
                {/* Take me on a journey integrated action */}
                <div className="bg-blue-900/40 p-4 border-t border-blue-500/30">
                  <button
                    type="button"
                    onClick={() => alert("Journey mode coming soon!")}
                    className="w-full group relative inline-flex items-center justify-center px-6 py-3 font-bold text-blue-100 transition-all duration-200 bg-blue-600/20 border border-blue-500/50 rounded-xl hover:bg-blue-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 overflow-hidden"
                  >
                    <Compass className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform duration-500 text-blue-400" />
                    Take me on a journey to "{query}"
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
