"use client";

import { useState, useCallback, memo } from "react";
import Spline from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineSceneInner({ scene, className = "" }: SplineSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false);

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

  return (
    <div className={`spline-scene-container relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-[var(--portfolio-accent)]" />
        </div>
      )}

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
