/* Shared by the mascot and the intro script that preloads its frames, so this file
   must not be a client module: the server layout needs the real strings. */

/*
 * Frames live in /public/astronaut, cut from the page-mascot astronaut's two
 * 3×3 sheets (directions + reactions) onto one shared 300px box, so every
 * frame is registered and swaps don't jitter. Art and head-aim logic from
 * page-mascot (github.com/nilbuild/page-mascot), MIT © Kamran Ahmed.
 */
export const DIRECTIONS = [
  "up-left",
  "up",
  "up-right",
  "left",
  "center",
  "right",
  "down-left",
  "down",
  "down-right",
] as const;

export const REACTIONS = [
  "blink",
  "love",
  "sparkle",
  "surprised",
  "starstruck",
  "blush",
  "sleepy",
  "dizzy",
  "laugh",
] as const;

export type Direction = (typeof DIRECTIONS)[number];
export type Reaction = (typeof REACTIONS)[number];

export const FRAMES = [
  ...DIRECTIONS.map((direction) => `look-${direction}`),
  ...REACTIONS,
];

export const ASTRONAUT_FRAME_URLS = FRAMES.map((frame) => `/astronaut/${frame}.webp`);
