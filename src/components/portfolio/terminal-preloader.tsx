"use client";

import { useState, useEffect } from "react";

export function TerminalPreloader() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Sequence of terminal lines appearing
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1500);
    const t3 = setTimeout(() => setStep(3), 2300);
    
    // Start fading out the entire screen
    const t4 = setTimeout(() => setIsFadingOut(true), 3500);
    
    // Fully unmount from DOM
    const t5 = setTimeout(() => setIsVisible(false), 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Prevent scrolling while the preloader is active
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  // Don't render anything once fully completed
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-(--portfolio-bg) px-6 transition-opacity duration-700 ease-in-out ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex w-full max-w-95 flex-col gap-2 font-mono text-[13px] text-white/70 sm:text-[15px]">
        <div>
          <span className="text-(--portfolio-accent)">{`>`}</span> initializing core systems...{" "}
          {step >= 1 ? <span className="text-[#4ade80]">[ok]</span> : <span className="animate-pulse font-bold text-white/50">_</span>}
        </div>
        
        {step >= 1 && (
          <div>
            <span className="text-(--portfolio-accent)">{`>`}</span> compiling geometric nodes...{" "}
            {step >= 2 ? <span className="text-[#4ade80]">[ok]</span> : <span className="animate-pulse font-bold text-white/50">_</span>}
          </div>
        )}
        
        {step >= 2 && (
          <div>
            <span className="text-(--portfolio-accent)">{`>`}</span> syncing logic modules...{" "}
            {step >= 3 ? <span className="text-[#4ade80]">[ok]</span> : <span className="animate-pulse font-bold text-white/50">_</span>}
          </div>
        )}
        
        {step >= 3 && (
          <div className="mt-3 text-[14px] font-bold text-(--portfolio-accent) sm:text-[16px]">
            {`<KhoiDo status="active" />`}
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
