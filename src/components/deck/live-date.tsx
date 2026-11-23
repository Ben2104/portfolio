"use client";

import { useSyncExternalStore } from "react";

/**
 * "November / 2026", read from the visitor's own clock (Date + Intl, no network call).
 * It re-reads at local midnight and when the tab becomes visible again, so a tab left open
 * across a month change corrects itself. The server snapshot is empty on purpose: the page is
 * prerendered, so any month printed there would be the build's, not the visitor's.
 */
const now = () => {
  const d = new Date();
  return `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(d)} / ${d.getFullYear()}`;
};

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const arm = () => {
    const d = new Date();
    const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    timer = setTimeout(() => {
      onChange();
      arm();
    }, midnight - d.getTime() + 500);
  };
  arm();
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export function LiveDate() {
  const text = useSyncExternalStore(subscribe, now, () => "");
  return (
    <span className="live-date" data-live-date aria-label={text ? `Today is ${text}` : undefined}>
      {text || " "}
    </span>
  );
}
