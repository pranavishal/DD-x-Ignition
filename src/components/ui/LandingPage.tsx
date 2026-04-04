"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Map as MapIcon, Compass, Loader2 } from "lucide-react";

interface LandingPageProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
}

export default function LandingPage({ onLocationSelect }: LandingPageProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        alert("Google Maps API Key is missing in .env.local");
        setIsSearching(false);
        return;
      }

      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const name = data.results[0].formatted_address;
        onLocationSelect({ lat, lng, name });
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

        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSearch} 
          className="w-full mb-8"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a city, landmark, or address..."
              className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-2xl py-5 pl-14 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 transition-all backdrop-blur-md"
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
          </div>
        </motion.form>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="h-px w-12 bg-gray-800" />
            <span>OR</span>
            <span className="h-px w-12 bg-gray-800" />
          </div>

          <button
            type="button"
            onClick={() => alert("Journey mode coming soon!")}
            className="mt-8 group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent border border-white/20 rounded-2xl hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
            <Compass className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform duration-500" />
            Take me on a journey
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
