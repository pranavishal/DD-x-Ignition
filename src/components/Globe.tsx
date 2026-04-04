"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import createGlobe, { type Marker } from "cobe";

interface GlobeProps {
  className?: string;
  markers?: Marker[];
}

export default function Globe({ className, markers }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  const defaultMarkers: Marker[] = [
    { location: [25.276987, 51.520008], size: 0.07 }, // Doha, Qatar
    { location: [43.4643, -80.5204], size: 0.07 },    // Waterloo, Canada
  ];

  const activeMarkers = markers ?? defaultMarkers;

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      widthRef.current = containerRef.current.getBoundingClientRect().width;
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    updateSize();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateSize, 100);
    };
    window.addEventListener("resize", handleResize);

    const dpr = Math.min(window.devicePixelRatio, 2);

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width: widthRef.current * dpr,
      height: widthRef.current * dpr,
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.95, 0.95, 0.95],
      markerColor: [0.1, 0.1, 0.1],
      glowColor: [0.9, 0.9, 0.9],
      markers: activeMarkers,
    });

    // Animation loop
    let animationId: number;
    const animate = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.005;
      }
      globe.update({
        phi: phiRef.current + pointerInteractionMovement.current,
        width: widthRef.current * dpr,
        height: widthRef.current * dpr,
      });
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      globe.destroy();
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    (e.target as HTMLElement).style.cursor = "grabbing";
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointerInteracting.current = null;
    (e.target as HTMLElement).style.cursor = "grab";
  };

  const handlePointerOut = (e: React.PointerEvent) => {
    pointerInteracting.current = null;
    (e.target as HTMLElement).style.cursor = "grab";
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta / 200;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerMove}
        className="w-full h-full cursor-grab"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 1s ease",
          contain: "layout paint size",
        }}
      />
      {/* Radial gradient overlay to fade edges into background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 40%, white 80%)",
        }}
      />
    </div>
  );
}
