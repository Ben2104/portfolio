/* Shared by the server layout and the client overlay, so this file must not be
   a client module: layout.tsx needs the real strings, not client references. */

export type IntroPhase = "holding" | "exiting" | "done";

// Clear this key in DevTools session storage to replay the intro locally.
export const INTRO_SESSION_KEY = "portfolio-intro-seen";

/* Runs during HTML parsing, before first paint, so a repeat session never sees
   the overlay flash. See next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md */
export const INTRO_SKIP_SCRIPT = `(function(){try{if(sessionStorage.getItem("${INTRO_SESSION_KEY}")==="true")document.documentElement.setAttribute("data-intro","skip")}catch(e){}})()`;
