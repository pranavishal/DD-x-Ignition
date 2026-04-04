"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Volume2, VolumeX, SkipForward } from "lucide-react";
import { JourneyData } from "../../types";

interface JourneyPlayerProps {
  journeyData: JourneyData;
  viewer: any;
  onEnd: () => void;
}

const TEXT_SHADOW = "0 2px 12px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.5)";
const TEXT_SHADOW_SM = "0 1px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)";

export default function JourneyPlayer({ journeyData, viewer, onEnd }: JourneyPlayerProps) {
  const [phase, setPhase] = useState<"intro" | "landmark" | "outro">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFlying, setIsFlying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const orbitRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const isMutedRef = useRef(isMuted);
  // Resolve function for the current audio promise — used by skip
  const audioResolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Reset image state when landmark changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentIndex]);

  const totalLandmarks = journeyData.landmarks.length;
  const currentLandmark = journeyData.landmarks[currentIndex];

  const landmarkImageUrl = currentLandmark?.photoUrl || null;

  // Orchestration — each effect invocation gets its own abort flag
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    // Local abort flag scoped to THIS effect invocation.
    // Strict Mode re-mount gets a fresh one.
    let aborted = false;

    // --- Helpers ---

    function stopOrbit() {
      if (orbitRef.current !== null) {
        cancelAnimationFrame(orbitRef.current);
        orbitRef.current = null;
      }
    }

    function stopProgressTimer() {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }

    function stopAudio() {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current = null;
      }
      audioResolveRef.current = null;
    }

    function fullCleanup() {
      stopOrbit();
      stopProgressTimer();
      stopAudio();
    }

    // Fly camera — resolves via setTimeout (more reliable than Cesium complete callback)
    function flyTo(lat: number, lng: number, height: number, durationSec: number): Promise<void> {
      return new Promise((resolve) => {
        if (aborted || !viewer || viewer.isDestroyed()) { resolve(); return; }
        setIsFlying(true);
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
          orientation: {
            heading: Cesium.Math.toRadians(60),
            pitch: Cesium.Math.toRadians(-30),
          },
          duration: durationSec,
        });
        setTimeout(() => {
          setIsFlying(false);
          resolve();
        }, durationSec * 1000 + 400);
      });
    }

    // Play audio clip — always resolves (never hangs)
    function playAudioClip(audioUrl: string | undefined): Promise<void> {
      return new Promise((resolve) => {
        stopAudio();
        stopProgressTimer();
        setProgress(0);

        if (aborted) { resolve(); return; }

        let resolved = false;
        const done = () => {
          if (resolved) return;
          resolved = true;
          audioResolveRef.current = null;
          resolve();
        };

        // Store resolve so skip button can call it
        audioResolveRef.current = done;

        // Safety max: 20s
        const safetyTimer = setTimeout(done, 20000);
        const safeDone = () => { clearTimeout(safetyTimer); done(); };

        if (!audioUrl) {
          clearTimeout(safetyTimer);
          const start = Date.now();
          const dur = 5000;
          progressTimerRef.current = window.setInterval(() => {
            if (aborted) { stopProgressTimer(); safeDone(); return; }
            const elapsed = Date.now() - start;
            setProgress(Math.min(elapsed / dur, 1));
            if (elapsed >= dur) {
              stopProgressTimer();
              safeDone();
            }
          }, 100);
          return;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.muted = isMutedRef.current;

        audio.addEventListener("timeupdate", () => {
          if (audio.duration && isFinite(audio.duration)) {
            setProgress(audio.currentTime / audio.duration);
          }
        });
        audio.addEventListener("ended", safeDone);
        audio.addEventListener("error", safeDone);
        audio.play().catch(safeDone);
      });
    }

    function startOrbit() {
      stopOrbit();
      if (!viewer || viewer.isDestroyed()) return;
      const rotate = () => {
        if (aborted || !viewer || viewer.isDestroyed()) { stopOrbit(); return; }
        viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(0.08));
        orbitRef.current = requestAnimationFrame(rotate);
      };
      orbitRef.current = requestAnimationFrame(rotate);
    }

    // --- Main journey sequence ---
    async function runJourney() {
      const landmarks = journeyData.landmarks;
      if (!landmarks.length) return;

      // INTRO: fly high, show city name, play intro narration
      setPhase("intro");
      setProgress(0);
      setCurrentIndex(0);

      await flyTo(landmarks[0].lat - 0.02, landmarks[0].lng, 2500, 3);
      if (aborted) return;

      await playAudioClip((journeyData as any).introAudio);
      if (aborted) return;

      // LANDMARKS
      for (let i = 0; i < landmarks.length; i++) {
        if (aborted) return;

        setCurrentIndex(i);
        setPhase("landmark");
        setProgress(0);

        await flyTo(landmarks[i].lat, landmarks[i].lng, 800, 2.5);
        if (aborted) return;

        startOrbit();
        await playAudioClip(landmarks[i].audioUrl);
        stopOrbit();

        if (aborted) return;
      }

      // OUTRO
      if (!aborted) {
        stopOrbit();
        setPhase("outro");
        setProgress(1);
      }
    }

    runJourney();

    return () => {
      aborted = true;
      fullCleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, journeyData]);

  const handleEnd = useCallback(() => {
    onEnd();
  }, [onEnd]);

  const handleSkip = useCallback(() => {
    // Immediately resolve the current audio promise to advance
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioResolveRef.current) {
      audioResolveRef.current();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] pointer-events-none"
    >
      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-[7vh] bg-black/80 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[7vh] bg-black/80 pointer-events-none" />

      {/* Segmented progress bar */}
      <div className="absolute top-[7vh] left-0 right-0 flex gap-1 px-4 pt-3 pointer-events-none z-10">
        {journeyData.landmarks.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-150"
              style={{
                width:
                  i < currentIndex
                    ? "100%"
                    : i === currentIndex && phase === "landmark"
                    ? `${progress * 100}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Top controls */}
      <div className="absolute top-[7vh] right-4 pt-6 flex items-center gap-2 pointer-events-auto z-10">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
        <button
          onClick={handleSkip}
          className="p-2.5 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
          title="Skip to next"
        >
          <SkipForward className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleEnd}
          className="p-2.5 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
          title="End journey"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Intro overlay */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center px-8"
            >
              <p className="text-white text-sm uppercase tracking-[0.3em] mb-3 font-medium" style={{ textShadow: TEXT_SHADOW_SM }}>
                Your Journey Through
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{ textShadow: TEXT_SHADOW }}>
                {journeyData.cityName}
              </h1>
              <p className="text-white/90 text-lg max-w-lg mx-auto italic" style={{ textShadow: TEXT_SHADOW_SM }}>
                {journeyData.intro}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Landmark full-screen image */}
      <AnimatePresence mode="wait">
        {phase === "landmark" && currentLandmark && !isFlying && (
          <motion.div
            key={`landmark-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Landmark photo — full screen with slow Ken Burns zoom */}
            {landmarkImageUrl && !imageError && (
              <motion.img
                initial={{ scale: 1.05 }}
                animate={{ scale: 1.15 }}
                transition={{ duration: 15, ease: "linear" }}
                src={landmarkImageUrl}
                alt={currentLandmark.name}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}

            {/* Fallback background when no photo is available or image fails */}
            {(!landmarkImageUrl || imageError || !imageLoaded) && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-black" />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

            {/* Text content — bottom left */}
            <div className="absolute bottom-[9vh] left-8 max-w-xl">
              <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" />
                Stop {currentIndex + 1} of {totalLandmarks}
              </div>
              <motion.h3
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
                style={{ textShadow: TEXT_SHADOW }}
              >
                {currentLandmark.name}
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/90 text-base md:text-lg leading-relaxed max-w-md"
                style={{ textShadow: TEXT_SHADOW_SM }}
              >
                {currentLandmark.narration}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outro overlay */}
      <AnimatePresence>
        {phase === "outro" && (
          <motion.div
            key="outro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-auto"
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center px-8"
            >
              <h2 className="text-4xl font-bold text-white mb-3" style={{ textShadow: TEXT_SHADOW }}>
                Journey Complete
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto" style={{ textShadow: TEXT_SHADOW_SM }}>
                You&apos;ve explored {totalLandmarks} landmarks across {journeyData.cityName}.
                Now it&apos;s your turn to discover more.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleEnd}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-colors backdrop-blur-sm"
                >
                  Back to Home
                </button>
                <button
                  onClick={handleEnd}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/25"
                >
                  Explore {journeyData.cityName}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
