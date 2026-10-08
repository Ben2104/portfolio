/* Shared by the server layout and the client overlay, so this file must not be
   a client module: layout.tsx needs the real strings, not client references. */

import { ASTRONAUT_FRAME_URLS } from "./astronaut-frames";

export type IntroPhase = "holding" | "exiting" | "done";

// Clear this key in DevTools session storage to replay the intro locally.
export const INTRO_SESSION_KEY = "portfolio-intro-seen";

/* Shortest intro: on a fast connection the count climbs to 100 across this window,
   measured from navigation start */
const HOLD_MS = 1800;
/* Once the hold has passed, a count held back by the network closes the gap at this pace */
const CATCHUP_MS = 500;
/* Longest step the count takes in one frame, so a stalled main thread delays it
   instead of making it jump */
const MAX_FRAME_MS = 50;
/* A connection that never finishes must not strand the visitor */
export const INTRO_MAX_WAIT_MS = 10000;

/* What the inline script leaves on window for the overlay to pick up after hydration */
export type IntroProgress = {
  /* "timeout": the page never hydrated in time and the script hid the overlay itself */
  state: "loading" | "full" | "timeout";
  /* Counts hydration as loaded and registers who to tell when the count reaches 100 */
  hydrate: (onFull: (() => void) | null) => void;
};

declare global {
  interface Window {
    __portfolioIntro?: IntroProgress;
  }
}

/* Runs during HTML parsing, before first paint, so a repeat session never sees the
   overlay flash and a first visit starts counting long before the page hydrates.
   See next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md

   The count is the settled share of: every mascot frame, the web fonts, the window
   load event and hydration itself. It only writes to <html> (an attribute and the
   --intro-progress property that globals.css turns into the number and the ring),
   so it never touches anything React hydrates. */
export const INTRO_SCRIPT = `(function(){
var root=document.documentElement;
try{if(sessionStorage.getItem("${INTRO_SESSION_KEY}")==="true"){root.setAttribute("data-intro","skip");return}}catch(e){}
try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return}catch(e){}
var urls=${JSON.stringify(ASTRONAUT_FRAME_URLS)};
var total=urls.length+3,settled=0,shown=0,painted=0,last=performance.now(),hydrated=false,onFull=null,images=[];
var api=window.__portfolioIntro={state:"loading",hydrate:function(callback){
onFull=callback;
if(!hydrated){hydrated=true;settled++}
if(callback&&api.state==="full")callback();
}};
function settle(){settled++}
urls.forEach(function(url){var image=new Image();image.onload=image.onerror=settle;image.fetchPriority="low";image.src=url;images.push(image)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(settle,settle);else settle();
if(document.readyState==="complete")settle();else addEventListener("load",settle,{once:true});
root.setAttribute("data-intro","tracking");
function tick(now){
if(api.state!=="loading")return;
var rate=now<${HOLD_MS}?1/${HOLD_MS}:1/${CATCHUP_MS};
shown=Math.min(settled/total,shown+Math.min(${MAX_FRAME_MS},Math.max(0,now-last))*rate);
last=now;
var percent=Math.floor(shown*100);
if(percent!==painted){painted=percent;root.style.setProperty("--intro-progress",percent)}
if(shown>=1){api.state="full";if(onFull)onFull();return}
requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
setTimeout(function(){
if(hydrated||api.state!=="loading")return;
api.state="timeout";
root.setAttribute("data-intro","timeout");
},${INTRO_MAX_WAIT_MS});
})()`;
