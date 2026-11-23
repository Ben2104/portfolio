/** World units between two roles along the route. */
export const GAP = 16;
/** How far in front of a frame the camera rests while it shows that role. */
export const REST = 11;

/** The role on show at scroll progress 0..1. The camera hands over to the next role once it has flown through a frame. */
export const activeAt = (v: number, n: number) =>
  Math.min(n - 1, Math.max(0, Math.floor(v * (n - 1) + (1 - REST / GAP))));
