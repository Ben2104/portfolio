"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import Spline from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineSceneInner({ scene, className = "" }: SplineSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onLoad = useCallback((splineApp: Application) => {
    // Make the Spline canvas background transparent
    if (splineApp) {
      const canvas = document.querySelector(
        ".spline-scene-container canvas"
      ) as HTMLCanvasElement | null;
      if (canvas) {
        canvas.style.background = "transparent";
      }
    }
    setIsLoaded(true);
  }, []);

  // Block wheel events from reaching the Spline canvas
  // so scrolling the page doesn't zoom the 3D camera
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blockWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    // Use capture phase to intercept before Spline gets the event
    container.addEventListener("wheel", blockWheel, { capture: true, passive: true });

    return () => {
      container.removeEventListener("wheel", blockWheel, { capture: true });
    };
  }, []);

  return (
    <div ref={containerRef} className={`spline-scene-container relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-(--portfolio-accent)" />
        </div>
      )}

      {/* Transparent overlay to block scroll-zoom while allowing page scroll */}
      <div
        className="pointer-events-auto absolute inset-0 z-10"
        onWheel={(e) => e.stopPropagation()}
      />

      {/* Patch to cover the Spline watermark */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-16 w-72 bg-(--portfolio-bg)" />

      <Spline
        scene={scene}
        onLoad={onLoad}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
        }}
      />
    </div>
  );
}

export const SplineScene = memo(SplineSceneInner);
