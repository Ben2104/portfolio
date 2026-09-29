// @ts-nocheck — faithful port of ThreeUI's untyped shelf script; typing all 2k lines
// would mean rewriting it rather than porting it. The exported API below is typed.
/*
 * Project shelf engine — ported from ThreeUI "CompleteShelfLandingPage"
 * (public/landing-pages/complete-shelf-v2.html, sha256 606f200f…), MIT © 2026 Meng To,
 * github.com/MengTo/threeui. Structure, materials, motion and interactions follow the
 * original; changes are: portfolio projects as books, dark/orange retint, bounded shelf
 * with scroll hand-off at both ends, render-on-demand + visibility gating, shared and
 * lazily-built textures, fewer lights, and quality tiers.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* ── Tweakable constants ───────────────────────────────────────── */

export const SHELF_THEME = {
  background: "#1a1a1a",
  backgroundDeep: "#121212",
  ink: "#f4efe8",
  inkSoft: "#a8a29a",
  accent: "#ff8c42",
  shelfWood: "#3a2118",
  shelfWoodDark: "#1c0e0a",
  keyLight: "#f4d7b9",
  fillLight: "#9fb3c9",
  /* The 3D wall and floor are lit, so their base colours sit below the page background
     to land near #1a1a1a on screen and blend with the neighbouring sections */
  roomWall: "#121212",
  roomFloor: "#0b0b0b",
  /* How much each book's cloth tints the room behind it (0 = neutral) */
  roomTint: 0.05,
};

/* Cloth + foil pairs, assigned to projects in order */
export const SHELF_CLOTHS = [
  { color: "#1d2b45", foil: "#ff8c42" },
  { color: "#b4532a", foil: "#1c1a18" },
  { color: "#23392c", foil: "#e9c27a" },
  { color: "#5b1f1d", foil: "#ffb07a" },
  { color: "#2b2b30", foil: "#ff8c42" },
  { color: "#1f4550", foil: "#f1e3c8" },
  { color: "#3d2447", foil: "#f0b98d" },
  { color: "#a67a2e", foil: "#1c1a18" },
  { color: "#3a4757", foil: "#ff8c42" },
];

export const SHELF_QUALITY = {
  high: { pixelRatioCap: 1.5, shadowMapSize: 1024, shadows: true, antialias: true, areaLights: true, physical: true, textureScale: 1, anisotropy: 8 },
  low: { pixelRatioCap: 1.25, shadowMapSize: 0, shadows: false, antialias: false, areaLights: false, physical: false, textureScale: 0.67, anisotropy: 4 },
};

/* Book proportions cycle through the original seven volumes */
const BOOK_SHAPES = [
  { width: 1.02, height: 1.58, depth: 0.26 },
  { width: 1.1, height: 1.46, depth: 0.29 },
  { width: 0.92, height: 1.52, depth: 0.22 },
  { width: 1.08, height: 1.68, depth: 0.25 },
  { width: 1, height: 1.48, depth: 0.3 },
  { width: 0.96, height: 1.57, depth: 0.24 },
  { width: 1.12, height: 1.63, depth: 0.28 },
];
const MOTIFS = ["brackets", "paths", "caret", "orbits", "modules", "frames", "compass"];

const WOOD_TEXTURE_URL = "/projects/shelf/walnut.webp";
const TITLE_FONT = '"Clash Display", "Satoshi", "Helvetica Neue", Arial, sans-serif';
const LABEL_FONT = 'Satoshi, "Helvetica Neue", Arial, sans-serif';

/* Scroll hand-off: accumulated wheel delta that counts as one step, and the quiet gap
   that ends a gesture (trackpad momentum included) */
const WHEEL_STEP_THRESHOLD = 24;
const WHEEL_GESTURE_GAP_MS = 140;
const WHEEL_MIN_LOCK_MS = 280;
const SWIPE_MIN_PX = 48;

const pad = (value) => String(value).padStart(2, "0");

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* Blend in sRGB like CSS does; THREE.Color.lerp works in linear light and would let a
   5% tint of a bright cloth read as ~20% */
function mixHex(a: string, b: string, amount: number) {
  const channels = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const from = channels(a);
  const to = channels(b);
  return `#${from
    .map((value, index) => Math.round(value + (to[index] - value) * amount).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hostLabel(href) {
  try {
    const url = new URL(href);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return href;
  }
}

type ShelfProject = {
  readonly title: string;
  readonly subtitle?: string;
  readonly desc?: string;
  readonly tags?: readonly string[];
  readonly award?: string;
  readonly liveHref?: string;
  readonly sourceHref?: string;
  readonly devpostHref?: string;
};

export type ShelfBook = {
  id: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  award: string;
  links: { label: string; href: string }[];
  image: string;
  motifKey: string;
  color: string;
  foil: string;
  palette: Record<string, string>;
  width: number;
  height: number;
  depth: number;
  seed: number;
};

export type ShelfQuality = keyof typeof SHELF_QUALITY;

/* Map portfolio projects onto shelf volumes. Missing fields stay empty, never invented. */
export function buildShelfBooks(projects: readonly ShelfProject[]): ShelfBook[] {
  return projects.map((project, index) => {
    const cloth = SHELF_CLOTHS[index % SHELF_CLOTHS.length];
    const shape = BOOK_SHAPES[index % BOOK_SHAPES.length];
    const id = slugify(project.title);
    const links = [
      project.liveHref ? { label: "Live", href: project.liveHref } : null,
      project.sourceHref ? { label: "GitHub", href: project.sourceHref } : null,
      project.devpostHref ? { label: "Devpost", href: project.devpostHref } : null,
    ].filter(Boolean);
    const paper = mixHex(SHELF_THEME.background, cloth.color, SHELF_THEME.roomTint);
    const wall = mixHex(SHELF_THEME.roomWall, cloth.color, SHELF_THEME.roomTint);

    return {
      id,
      number: index + 1,
      title: project.title,
      tagline: project.subtitle || "",
      description: project.desc || "",
      tags: [...(project.tags || [])],
      award: project.award || "",
      links,
      image: `/projects/shelf/${id}.webp`,
      motifKey: MOTIFS[index % MOTIFS.length],
      color: cloth.color,
      foil: cloth.foil,
      palette: {
        paper,
        paperDeep: mixHex(SHELF_THEME.roomFloor, cloth.color, SHELF_THEME.roomTint * 0.6),
        paperPale: SHELF_THEME.ink,
        ink: SHELF_THEME.ink,
        inkSoft: SHELF_THEME.inkSoft,
        wall,
        shelf: SHELF_THEME.shelfWood,
        shelfDark: SHELF_THEME.shelfWoodDark,
        light: SHELF_THEME.keyLight,
        fill: SHELF_THEME.fillLight,
      },
      width: shape.width,
      height: shape.height,
      depth: shape.depth,
      seed: 11 * (index + 1),
    };
  });
}

export function detectShelfQuality(): ShelfQuality {
  /* ?shelf-quality=low|high forces a tier, for testing */
  const forced = new URLSearchParams(window.location.search).get("shelf-quality");
  if (forced === "low" || forced === "high") return forced;
  const nav = typeof navigator === "undefined" ? {} : navigator;
  const small = window.innerWidth < 820;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const fewCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  return small || coarse || lowMemory || fewCores ? "low" : "high";
}

/* ── Engine ────────────────────────────────────────────────────── */

export function createShelf({
  root,
  section,
  books: BOOKS,
  quality = detectShelfQuality(),
  onReady,
}: {
  root: HTMLElement;
  section: HTMLElement;
  books: ShelfBook[];
  quality?: ShelfQuality;
  onReady?: () => void;
}): () => void {
  const tier = SHELF_QUALITY[quality] || SHELF_QUALITY.high;
  const $ = (name) => root.querySelector(`[data-shelf="${name}"]`);

  const canvas = $("scene");
  const loading = $("loading");
  const fallbackStatus = $("fallback-status");
  const browseUi = $("browse-ui");
  const detailPanel = $("detail-panel");
  const selectionTitle = $("selection-title");
  const selectionNote = $("selection-note");
  const counter = $("counter");
  const markers = $("markers");
  const previousButton = $("previous");
  const nextButton = $("next");
  const inspectButton = $("inspect");
  const closeButton = $("close-detail");
  const resetButton = $("reset-view");
  const toggleBookButton = $("toggle-book");
  const previousPageButton = $("previous-page");
  const nextPageButton = $("next-page");
  const pageLabel = $("page-label");
  const pageCounter = $("page-counter");
  const detailMicrocopy = $("detail-microcopy");
  const detailEyebrow = $("detail-eyebrow");
  const detailTitle = $("detail-title");
  const detailDeck = $("detail-deck");
  const detailMeta = $("detail-meta");
  const liveRegion = $("live-region");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = THREE.MathUtils.clamp;
  const damp = THREE.MathUtils.damp;
  const lerp = THREE.MathUtils.lerp;
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const smootherstep = (value) => (
    value * value * value * (value * (value * 6 - 15) + 10)
  );
  const lastIndex = BOOKS.length - 1;

  const coverImages = new Map();
  let woodImage = null;

  let reducedMotion = reducedMotionQuery.matches;
  let renderer;
  let scene;
  let camera;
  let controls;
  let environmentTarget;
  let shelfStage;
  let bookRigs = [];
  let hitTargets = [];
  let rafId = 0;
  let lastTime = performance.now();
  let mode = "hero";
  let transitionTime = 0;
  let position = 0;
  let targetPosition = 0;
  let selectedIndex = 0;
  let hoveredIndex = -1;
  let focusReturnTarget = inspectButton;
  let activeBook = null;
  let readingOpen = false;
  let detailBookHovered = false;
  let currentSpread = 0;
  let pointerDirty = false;
  let suspended = false;
  let onScreen = false;
  let disposed = false;
  let needsAnotherFrame = false;
  let viewWidth = root.clientWidth || window.innerWidth;
  let viewHeight = root.clientHeight || window.innerHeight;
  let detailViewOffsetX = 0;
  let currentViewOffsetX = 0;
  let detailSafeWidth = viewWidth * 0.6;
  let themeInitialized = false;
  let themeMoving = false;
  let intersectionObserver = null;
  /* Dynamic resolution: drop the pixel ratio in steps (never below 1) if frames stay slow */
  let pixelRatio = Math.min(window.devicePixelRatio || 1, tier.pixelRatioCap);
  const frameBudget = { totalMs: 0, sampled: 0 };
  /* MSAA only while the canvas is small enough for it to be cheap; above ~4M pixels the
     density already hides edges and 4x samples dominate the frame */
  const MSAA_PIXEL_LIMIT = 4_000_000;
  let resizeObserver = null;

  /* Books visible either side of the view centre; set from the camera on resize */
  let halfVisibleBooks = 2.5;
  const wheel = { accumulated: 0, locked: false, lockedAt: 0, lastTime: 0, lastAbs: 0 };
  const swipe = { active: false, pointerId: null, startX: 0, startY: 0, consumed: false };

  const roomMaterials = {
    floor: null,
    wall: null,
    shelf: null,
    shelfDark: null,
    shadow: null
  };
  const roomLights = {
    hemisphere: null,
    key: null,
    softKey: null,
    fill: null,
    rim: null
  };
  const themeTargets = {
    floor: new THREE.Color(SHELF_THEME.roomFloor),
    wall: new THREE.Color(SHELF_THEME.roomWall),
    shelf: new THREE.Color(SHELF_THEME.shelfWood),
    shelfDark: new THREE.Color(SHELF_THEME.shelfWoodDark),
    shadow: new THREE.Color(SHELF_THEME.shelfWoodDark),
    fog: new THREE.Color(SHELF_THEME.roomWall),
    hemisphere: new THREE.Color(0xfff8e8),
    hemisphereGround: new THREE.Color(0x5b4030),
    key: new THREE.Color(SHELF_THEME.keyLight),
    fill: new THREE.Color(SHELF_THEME.fillLight),
    rim: new THREE.Color(SHELF_THEME.accent)
  };

  const pointer = {
    ndc: new THREE.Vector2(3, 3),
    clientX: 0,
    clientY: 0
  };
  const pageDrag = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    progress: 0,
    peakProgress: 0,
    committed: false,
    progressVelocity: 0,
    verticalBias: 0,
    lastProgress: 0,
    lastTime: 0,
    direction: 0,
    kind: null
  };
  const detailPress = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    moved: false,
    allowClick: false
  };

  const raycaster = new THREE.Raycaster();
  const shelfCameraPosition = new THREE.Vector3();
  const shelfCameraTarget = new THREE.Vector3();
  const inspectPosition = new THREE.Vector3();
  const inspectCameraPosition = new THREE.Vector3();
  const inspectCameraTarget = new THREE.Vector3();
  const transitionCameraTarget = new THREE.Vector3();
  const openingBookPosition = new THREE.Vector3();
  const openingBookQuaternion = new THREE.Quaternion();
  const openingBookScale = new THREE.Vector3();
  const openingMotionPosition = new THREE.Vector3();
  const openingMotionQuaternion = new THREE.Quaternion();
  const restingMotionPosition = new THREE.Vector3();
  const restingMotionQuaternion = new THREE.Quaternion();
  const openingCameraPosition = new THREE.Vector3();
  const openingCameraTarget = new THREE.Vector3();
  const openingShelfPosition = new THREE.Vector3();
  const inspectShelfPosition = new THREE.Vector3(0, -4.2, -3);
  const inspectBookQuaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0.055, -0.14, 0)
  );
  const inspectBookScale = new THREE.Vector3();
  const closingBookPosition = new THREE.Vector3();
  const closingBookStartPosition = new THREE.Vector3();
  const closingBookStartQuaternion = new THREE.Quaternion();
  const closingBookStartScale = new THREE.Vector3();
  const closingBookQuaternion = new THREE.Quaternion();
  const closingBookScale = new THREE.Vector3(1.09, 1.09, 1.09);
  const closingMotionPosition = new THREE.Vector3();
  const closingMotionQuaternion = new THREE.Quaternion();
  const closingCameraPosition = new THREE.Vector3();
  const closingCameraTarget = new THREE.Vector3();
  const closingShelfPosition = new THREE.Vector3();
  const shelfRestPosition = new THREE.Vector3();
  const shelfBoardTop = 0.47;
  const spacing = 1.5;
  const PAGINATED_LEAF_COUNT = 4;
  const SPREAD_COUNT = PAGINATED_LEAF_COUNT + 1;
  const FLEXIBLE_PAGE_SEGMENTS = 18;
  const FLEXIBLE_PAGE_VERTICAL_SEGMENTS = 8;
  const PAGE_TURN_COMMIT_PROGRESS = 0.18;
  const COVER_OPEN_COMMIT_PROGRESS = 0.16;
  const COVER_CLOSE_COMMIT_PROGRESS = 0.2;
  const DETAIL_TRANSITION_DURATION = 0.92;
  const SHELF_TRANSITION_DURATION = 0.92;
  let openingViewOffsetX = 0;
  let closingViewOffsetX = 0;

  /* Pages, edges and endpapers read the same with Standard as with a near-zero sheen
     Physical material, and cost far less per pixel */
  const shared = {
    box: new THREE.BoxGeometry(1, 1, 1),
    plane: new THREE.PlaneGeometry(1, 1),
    page: new THREE.MeshStandardMaterial({
      color: 0xe7dfcf,
      roughness: 0.95,
      metalness: 0
    }),
    pageSheet: new THREE.MeshStandardMaterial({
      color: 0xeee6d7,
      roughness: 0.955,
      metalness: 0,
      side: THREE.DoubleSide
    }),
    headband: new THREE.MeshStandardMaterial({
      color: 0xc6a66d,
      roughness: 0.58,
      metalness: 0.16
    }),
    walnut: new THREE.MeshStandardMaterial({
      color: 0x4a2b1d,
      roughness: 0.58,
      metalness: 0
    }),
    walnutDark: new THREE.MeshStandardMaterial({
      color: 0x2a170f,
      roughness: 0.7,
      metalness: 0
    })
  };

  /* Physical where sheen/clearcoat carry the look; Standard on the low tier */
  function clothMaterial(params) {
    if (tier.physical) return new THREE.MeshPhysicalMaterial(params);
    const { sheen, sheenRoughness, sheenColor, clearcoat, clearcoatRoughness, ...rest } = params;
    return new THREE.MeshStandardMaterial(rest);
  }

  function createFadeMaterial(baseMaterial) {
    const material = baseMaterial.clone();
    material.transparent = true;
    material.opacity = 1;
    return material;
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeCanvas(width, height) {
    const element = document.createElement("canvas");
    element.width = Math.round(width * tier.textureScale);
    element.height = Math.round(height * tier.textureScale);
    const ctx = element.getContext("2d");
    if (tier.textureScale !== 1) ctx.scale(tier.textureScale, tier.textureScale);
    return { element, ctx, width, height };
  }

  function drawMotif(ctx, book, width, height) {
    const foil = book.foil;
    ctx.save();
    ctx.strokeStyle = foil;
    ctx.fillStyle = foil;
    ctx.lineWidth = Math.max(3, width * 0.004);
    ctx.globalAlpha = 0.88;
    const centerX = width * 0.5;
    const centerY = height * 0.38;
    const size = Math.min(width, height) * 0.22;

    if (book.motifKey === "brackets") {
      for (let layer = 0; layer < 3; layer += 1) {
        const inset = layer * size * 0.22;
        const left = centerX - size + inset;
        const right = centerX + size - inset;
        const top = centerY - size * 0.72 + inset;
        const bottom = centerY + size * 0.72 - inset;
        ctx.beginPath();
        ctx.moveTo(left + size * 0.25, top);
        ctx.lineTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(left + size * 0.25, bottom);
        ctx.moveTo(right - size * 0.25, top);
        ctx.lineTo(right, top);
        ctx.lineTo(right, bottom);
        ctx.lineTo(right - size * 0.25, bottom);
        ctx.stroke();
      }
      ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
    } else if (book.motifKey === "paths") {
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY + size * 0.35);
      ctx.bezierCurveTo(centerX - size * 0.2, centerY - size, centerX + size * 0.1, centerY + size, centerX + size, centerY - size * 0.25);
      ctx.stroke();
      ctx.globalAlpha = 0.52;
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY - size * 0.45);
      ctx.bezierCurveTo(centerX - size * 0.25, centerY + size, centerX + size * 0.3, centerY - size, centerX + size, centerY + size * 0.45);
      ctx.stroke();
      for (let point = -1; point <= 1; point += 1) {
        ctx.beginPath();
        ctx.arc(centerX + point * size, centerY - point * size * 0.25, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (book.motifKey === "caret") {
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.9, centerY + size * 0.6);
      ctx.lineTo(centerX, centerY - size * 0.65);
      ctx.lineTo(centerX + size * 0.9, centerY + size * 0.6);
      ctx.stroke();
      ctx.globalAlpha = 0.38;
      for (let line = -2; line <= 2; line += 1) {
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY + line * size * 0.28);
        ctx.lineTo(centerX + size, centerY + line * size * 0.28);
        ctx.stroke();
      }
    } else if (book.motifKey === "orbits") {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size, size * 0.42, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.58;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size * 0.72, size, 0.52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(centerX + size * 0.64, centerY - size * 0.34, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(centerX - 6, centerY - 6, 12, 12);
    } else if (book.motifKey === "modules") {
      const moduleSize = size * 0.54;
      const positions = [
        [-0.55, -0.5, "circle"],
        [0.25, -0.5, "rect"],
        [-0.55, 0.3, "rect"],
        [0.25, 0.3, "circle"]
      ];
      positions.forEach(([x, y, shape], index) => {
        ctx.globalAlpha = 0.45 + index * 0.12;
        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(centerX + x * size, centerY + y * size, moduleSize * 0.48, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeRect(
            centerX + x * size - moduleSize * 0.5,
            centerY + y * size - moduleSize * 0.5,
            moduleSize,
            moduleSize
          );
        }
      });
    } else if (book.motifKey === "frames") {
      for (let layer = 0; layer < 4; layer += 1) {
        ctx.globalAlpha = 0.9 - layer * 0.17;
        const offset = layer * size * 0.18;
        ctx.strokeRect(
          centerX - size + offset,
          centerY - size * 0.7 + offset,
          size * 2 - offset * 2,
          size * 1.4 - offset * 2
        );
      }
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY - size * 0.7);
      ctx.lineTo(centerX + size, centerY + size * 0.7);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.78, 0.15, Math.PI * 1.82);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.72, centerY + size * 0.88);
      ctx.lineTo(centerX, centerY - size * 0.92);
      ctx.lineTo(centerX + size * 0.72, centerY + size * 0.88);
      ctx.stroke();
      ctx.globalAlpha = 0.48;
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY);
      ctx.lineTo(centerX + size, centerY);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* Screenshot as a tipped-in plate: cover-fit into the box, with a hairline border */
  function drawPlate(ctx, book, x, y, width, height, { border = book.foil, shadow = true } = {}) {
    const image = coverImages.get(book.id);
    if (!image) {
      ctx.save();
      ctx.translate(x, y);
      drawMotif(ctx, book, width, height * 2.2);
      ctx.restore();
      return false;
    }
    if (shadow) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.fillRect(x + 6, y + 9, width, height);
      ctx.restore();
    }
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    ctx.drawImage(
      image,
      (image.naturalWidth - sourceWidth) * 0.5,
      (image.naturalHeight - sourceHeight) * 0.35,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );
    ctx.save();
    ctx.strokeStyle = border;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, width - 1.5, height - 1.5);
    ctx.restore();
    return true;
  }

  function wrapLines(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  /* Largest title size (within bounds) that fits maxLines; draws bottom-anchored */
  function drawFittedTitle(ctx, text, x, bottomY, maxWidth, {
    maxSize = 78,
    minSize = 34,
    maxLines = 3,
    weight = 500,
    lineHeight = 1.02,
    align = "left"
  } = {}) {
    let size = maxSize;
    let lines = [];
    for (; size >= minSize; size -= 2) {
      ctx.font = `${weight} ${size}px ${TITLE_FONT}`;
      lines = wrapLines(ctx, text, maxWidth);
      if (lines.length <= maxLines && lines.every((line) => ctx.measureText(line).width <= maxWidth)) break;
    }
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, "")}…`;
    }
    ctx.textAlign = align;
    const step = size * lineHeight;
    lines.forEach((line, index) => {
      ctx.fillText(line, x, bottomY - (lines.length - 1 - index) * step);
    });
    return { size, lines, top: bottomY - (lines.length - 1) * step - size };
  }

  let sharedPaperFaceTexture = null;
  let sharedPageEdgeTextures = null;
  let sharedContactShadowTexture = null;
  let sharedClothBumpTexture = null;
  let sharedClothSurfaceMaps = null;

  function configureCanvasTexture(texture, {
    color = true,
    anisotropy = tier.anisotropy
  } = {}) {
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(
      anisotropy,
      renderer.capabilities.getMaxAnisotropy()
    );
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }

  function makeCoverTexture(book) {
    const { element, ctx, width, height } = makeCanvas(768, 1152);
    const random = seededRandom(hashSeed(book.id) + book.seed);

    ctx.fillStyle = book.color;
    ctx.fillRect(0, 0, width, height);

    const edge = ctx.createLinearGradient(0, 0, width, 0);
    edge.addColorStop(0, "rgba(0,0,0,0.24)");
    edge.addColorStop(0.075, "rgba(255,255,255,0.035)");
    edge.addColorStop(0.5, "rgba(255,255,255,0.01)");
    edge.addColorStop(0.94, "rgba(0,0,0,0.06)");
    edge.addColorStop(1, "rgba(0,0,0,0.19)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, width, height);

    for (let line = 0; line < 1250; line += 1) {
      const x = random() * width;
      const y = random() * height;
      const length = 4 + random() * 22;
      ctx.strokeStyle = random() > 0.5 ? "rgba(255,255,255,0.024)" : "rgba(0,0,0,0.025)";
      ctx.lineWidth = 0.6 + random() * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + (random() - 0.5) * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = book.foil;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, width - 84, height - 84);
    ctx.strokeRect(55, 55, width - 110, height - 110);
    ctx.globalAlpha = 1;

    /* The project's screenshot takes the place of the original cover artwork */
    drawPlate(ctx, book, 96, 168, width - 192, 430);

    const edgeShade = ctx.createLinearGradient(0, 0, width, 0);
    edgeShade.addColorStop(0, "rgba(0,0,0,0.16)");
    edgeShade.addColorStop(0.055, "rgba(255,255,255,0.015)");
    edgeShade.addColorStop(0.93, "rgba(255,255,255,0)");
    edgeShade.addColorStop(1, "rgba(0,0,0,0.1)");
    ctx.fillStyle = edgeShade;
    ctx.fillRect(0, 0, width, height);

    return configureCanvasTexture(new THREE.CanvasTexture(element));
  }

  function makeFoilTexture(book) {
    const { element, ctx, width, height } = makeCanvas(768, 1152);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.font = `600 16px ${LABEL_FONT}`;
    ctx.letterSpacing = "3px";
    ctx.fillText(`PROJECT  /  ${pad(book.number)}`, 96, 120);
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(96, 136);
    ctx.lineTo(210, 136);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.letterSpacing = "0px";

    const bottom = book.tagline ? 1000 : 1036;
    drawFittedTitle(ctx, book.title, 96, bottom, width - 192, { maxSize: 76, minSize: 36, maxLines: 3 });
    if (book.tagline) {
      ctx.font = `600 15px ${LABEL_FONT}`;
      ctx.letterSpacing = "2.4px";
      const tagline = wrapLines(ctx, book.tagline.toUpperCase(), width - 192)[0];
      ctx.fillText(tagline, 98, 1052);
    }

    return configureCanvasTexture(new THREE.CanvasTexture(element));
  }

  /* One cloth weave shared by every book (was built per book, pixel by pixel) */
  function makeClothBumpTexture() {
    if (sharedClothBumpTexture) return sharedClothBumpTexture;
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = 256;
    bumpCanvas.height = 256;
    const ctx = bumpCanvas.getContext("2d");
    const random = seededRandom(hashSeed("portfolio-cloth") + 11);

    ctx.fillStyle = "#7f7f7f";
    ctx.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);

    for (let line = 0; line < 256; line += 2) {
      const value = Math.round(98 + random() * 70);
      ctx.strokeStyle = `rgb(${value},${value},${value})`;
      ctx.globalAlpha = 0.34 + random() * 0.18;
      ctx.lineWidth = 0.65 + random() * 0.45;
      ctx.beginPath();
      ctx.moveTo(0, line + (random() - 0.5));
      ctx.lineTo(256, line + (random() - 0.5));
      ctx.stroke();
    }

    for (let line = 1; line < 256; line += 3) {
      const value = Math.round(105 + random() * 58);
      ctx.strokeStyle = `rgb(${value},${value},${value})`;
      ctx.globalAlpha = 0.25 + random() * 0.14;
      ctx.lineWidth = 0.55 + random() * 0.35;
      ctx.beginPath();
      ctx.moveTo(line + (random() - 0.5), 0);
      ctx.lineTo(line + (random() - 0.5), 256);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    const texture = new THREE.CanvasTexture(bumpCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 8);
    sharedClothBumpTexture = configureCanvasTexture(texture, { color: false });
    return sharedClothBumpTexture;
  }

  function makeClothSurfaceMaps() {
    if (sharedClothSurfaceMaps) return sharedClothSurfaceMaps;
    const size = 256;
    const heightField = new Float32Array(size * size);
    const normalCanvas = document.createElement("canvas");
    const roughnessCanvas = document.createElement("canvas");
    normalCanvas.width = roughnessCanvas.width = size;
    normalCanvas.height = roughnessCanvas.height = size;
    const normalContext = normalCanvas.getContext("2d");
    const roughnessContext = roughnessCanvas.getContext("2d");
    const normalImage = normalContext.createImageData(size, size);
    const roughnessImage = roughnessContext.createImageData(size, size);
    const phase = 0.23;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const warp = Math.sin((x + phase) * Math.PI * 0.52);
        const weft = Math.sin((y - phase) * Math.PI * 0.41);
        const cross = Math.sin((x + y + phase) * Math.PI * 0.19);
        heightField[y * size + x] = 0.5 + warp * 0.18 + weft * 0.15 + cross * 0.045;
      }
    }

    const sampleHeight = (x, y) => {
      const wrappedX = (x + size) % size;
      const wrappedY = (y + size) % size;
      return heightField[wrappedY * size + wrappedX];
    };

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = y * size + x;
        const pixel = index * 4;
        const dx = (sampleHeight(x + 1, y) - sampleHeight(x - 1, y)) * 1.5;
        const dy = (sampleHeight(x, y + 1) - sampleHeight(x, y - 1)) * 1.5;
        const length = Math.hypot(dx, dy, 1);
        normalImage.data[pixel] = Math.round(((-dx / length) * 0.5 + 0.5) * 255);
        normalImage.data[pixel + 1] = Math.round(((-dy / length) * 0.5 + 0.5) * 255);
        normalImage.data[pixel + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
        normalImage.data[pixel + 3] = 255;

        const roughness = Math.round(188 + heightField[index] * 56);
        roughnessImage.data[pixel] = roughness;
        roughnessImage.data[pixel + 1] = roughness;
        roughnessImage.data[pixel + 2] = roughness;
        roughnessImage.data[pixel + 3] = 255;
      }
    }

    normalContext.putImageData(normalImage, 0, 0);
    roughnessContext.putImageData(roughnessImage, 0, 0);

    const configureWeaveMap = (weaveCanvas, suffix) => {
      const texture = new THREE.CanvasTexture(weaveCanvas);
      texture.name = `cloth-${suffix}`;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 8);
      return configureCanvasTexture(texture, { color: false });
    };

    sharedClothSurfaceMaps = {
      normal: configureWeaveMap(normalCanvas, "normal"),
      roughness: configureWeaveMap(roughnessCanvas, "roughness")
    };
    return sharedClothSurfaceMaps;
  }

  function drawPaperSurface(ctx, width, height, random) {
    ctx.fillStyle = "#e8e1d3";
    ctx.fillRect(0, 0, width, height);

    const paperWash = ctx.createLinearGradient(0, 0, width, height);
    paperWash.addColorStop(0, "rgba(255,255,255,0.22)");
    paperWash.addColorStop(0.42, "rgba(255,255,255,0.035)");
    paperWash.addColorStop(1, "rgba(103,87,64,0.08)");
    ctx.fillStyle = paperWash;
    ctx.fillRect(0, 0, width, height);

    for (let fiber = 0; fiber < 2400; fiber += 1) {
      const x = random() * width;
      const y = random() * height;
      const length = 5 + random() * 34;
      const lightFiber = random() > 0.44;
      ctx.strokeStyle = lightFiber
        ? `rgba(255,255,255,${0.025 + random() * 0.045})`
        : `rgba(92,76,55,${0.018 + random() * 0.035})`;
      ctx.lineWidth = 0.45 + random() * 0.65;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        Math.min(width, x + length),
        y + (random() - 0.5) * 2.2
      );
      ctx.stroke();
    }

    for (let fleck = 0; fleck < 1200; fleck += 1) {
      const tone = Math.round(112 + random() * 94);
      ctx.fillStyle = `rgba(${tone},${tone - 5},${tone - 13},${0.016 + random() * 0.025})`;
      const size = 0.5 + random() * 1.1;
      ctx.fillRect(random() * width, random() * height, size, size);
    }
  }

  /* Paper grain is drawn once and copied, instead of ~3,600 strokes per page */
  let paperStock = null;
  function drawPaperStock(ctx, width, height) {
    if (!paperStock) {
      paperStock = document.createElement("canvas");
      paperStock.width = 512;
      paperStock.height = 768;
      drawPaperSurface(paperStock.getContext("2d"), 512, 768, seededRandom(hashSeed("portfolio-paper-stock")));
    }
    ctx.drawImage(paperStock, 0, 0, width, height);
  }

  function makePaperFaceTexture() {
    if (sharedPaperFaceTexture) return sharedPaperFaceTexture;
    const { element, ctx, width, height } = makeCanvas(768, 1152);
    drawPaperStock(ctx, width, height);
    sharedPaperFaceTexture = configureCanvasTexture(new THREE.CanvasTexture(element));
    return sharedPaperFaceTexture;
  }

  function drawWrappedCanvasText(ctx, text, x, y, maxCharacters, lineHeight, maxLines = 6) {
    const words = text.split(/\s+/);
    let line = "";
    let lineIndex = 0;

    words.forEach((word) => {
      if (lineIndex >= maxLines) return;
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxCharacters && line) {
        ctx.fillText(line, x, y + lineIndex * lineHeight);
        line = word;
        lineIndex += 1;
      } else {
        line = candidate;
      }
    });

    if (line && lineIndex < maxLines) {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
    }
  }

  function makeEndpaperTexture(book) {
    const { element, ctx, width, height } = makeCanvas(512, 768);
    drawPaperStock(ctx, width, height);

    ctx.save();
    ctx.fillStyle = book.color;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = book.foil;
    ctx.lineWidth = 1;
    for (let x = 28; x < width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 24; y < height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.42;
    drawMotif(ctx, { ...book, foil: "#8a7f72" }, width, height);
    ctx.restore();

    const texture = configureCanvasTexture(new THREE.CanvasTexture(element));
    texture.name = `${book.id}-patterned-endpaper`;
    return texture;
  }

  /* Eight printed pages carrying the project: title, overview, plate, stack, links, colophon */
  function makeInteriorPageTextures(book) {
    const pageCount = 8;
    const inkColor = new THREE.Color(book.color).lerp(new THREE.Color(0x211b16), 0.62);
    const ink = `#${inkColor.getHexString()}`;
    const accent = new THREE.Color(SHELF_THEME.accent).lerp(new THREE.Color(0x211b16), 0.18);
    const accentInk = `#${accent.getHexString()}`;

    return Array.from({ length: pageCount }, (_, pageIndex) => {
      const logicalWidth = 512;
      const logicalHeight = 768;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = Math.round(384 * tier.textureScale);
      pageCanvas.height = Math.round(576 * tier.textureScale);
      const ctx = pageCanvas.getContext("2d");
      ctx.scale(0.75 * tier.textureScale, 0.75 * tier.textureScale);
      const random = seededRandom(hashSeed(`${book.id}-leaf-${pageIndex}`) + book.seed);
      drawPaperStock(ctx, logicalWidth, logicalHeight);
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      ctx.globalAlpha = 0.58;
      ctx.font = `600 10px ${LABEL_FONT}`;
      ctx.letterSpacing = "1.8px";
      ctx.fillText(`PROJECT  /  ${pad(book.number)}`, 48, 48);
      ctx.textAlign = "right";
      ctx.fillText(pad(pageIndex + 1), logicalWidth - 48, 48);
      ctx.textAlign = "left";
      ctx.fillRect(48, 64, logicalWidth - 96, 1);
      ctx.globalAlpha = 1;

      const label = (text, y) => {
        ctx.font = `600 11px ${LABEL_FONT}`;
        ctx.letterSpacing = "2px";
        ctx.fillStyle = accentInk;
        ctx.fillText(text, 54, y);
        ctx.fillStyle = ink;
        ctx.letterSpacing = "0px";
      };
      const body = (text, y, maxLines, size = 19, lineHeight = 28) => {
        ctx.globalAlpha = 0.72;
        ctx.font = `400 ${size}px ${LABEL_FONT}`;
        const lines = wrapLines(ctx, text, logicalWidth - 108).slice(0, maxLines);
        lines.forEach((line, index) => ctx.fillText(line, 54, y + index * lineHeight));
        ctx.globalAlpha = 1;
        return y + lines.length * lineHeight;
      };

      if (pageIndex === 0) {
        label(book.award ? "AWARD-WINNING PROJECT" : "SELECTED PROJECT", 174);
        ctx.fillStyle = ink;
        drawFittedTitle(ctx, book.title, 52, 300, logicalWidth - 104, { maxSize: 58, minSize: 30, maxLines: 3 });
        if (book.tagline) body(book.tagline, 380, 3, 20, 28);
        if (book.award) body(book.award, book.tagline ? 480 : 380, 3, 17, 25);
      } else if (pageIndex === 1) {
        label("01  —  OVERVIEW", 166);
        ctx.font = `500 44px ${TITLE_FONT}`;
        ctx.fillText("Overview", 52, 236);
        body(book.description, 300, 13, 18, 27);
      } else if (pageIndex === 2 || pageIndex === 6) {
        label(pageIndex === 2 ? "PLATE 01  /  INTERFACE" : "PLATE 02  /  DETAIL", 146);
        const plateHeight = pageIndex === 2 ? 300 : 420;
        if (!drawPlate(ctx, book, 54, 190, logicalWidth - 108, plateHeight, { border: ink, shadow: false })) {
          ctx.save();
          ctx.globalAlpha = 0.58;
          drawMotif(ctx, { ...book, foil: ink }, logicalWidth, logicalHeight * 0.92);
          ctx.restore();
        }
        ctx.globalAlpha = 0.52;
        ctx.font = `400 16px ${LABEL_FONT}`;
        ctx.fillText(book.title, 54, 650);
        ctx.globalAlpha = 1;
      } else if (pageIndex === 3) {
        label("02  —  TECH STACK", 166);
        ctx.font = `500 44px ${TITLE_FONT}`;
        ctx.fillText("Built with", 52, 236);
        ctx.font = `500 18px ${LABEL_FONT}`;
        book.tags.slice(0, 16).forEach((tag, index) => {
          const column = index % 2;
          const row = Math.floor(index / 2);
          const x = 54 + column * 210;
          const y = 302 + row * 40;
          ctx.globalAlpha = 0.34;
          ctx.fillRect(x, y + 12, 188, 1);
          ctx.globalAlpha = 0.82;
          ctx.fillText(tag, x, y);
        });
        ctx.globalAlpha = 1;
      } else if (pageIndex === 4) {
        label("NOTES", 138);
        ctx.globalAlpha = 0.44;
        for (let column = 0; column < 2; column += 1) {
          const left = 54 + column * 214;
          for (let line = 0; line < 24; line += 1) {
            const width = line % 7 === 6 ? 72 + random() * 54 : 138 + random() * 44;
            ctx.fillRect(left, 190 + line * 18, width, 1.25);
          }
        }
        ctx.globalAlpha = 0.78;
        ctx.strokeRect(54, 654, 404, 54);
        ctx.font = `600 10px ${LABEL_FONT}`;
        ctx.letterSpacing = "1.4px";
        ctx.fillText(book.tags.slice(0, 3).join("  ·  ").toUpperCase(), 70, 686);
        ctx.letterSpacing = "0px";
        ctx.globalAlpha = 1;
      } else if (pageIndex === 5) {
        label("03  —  LINKS", 166);
        ctx.font = `500 44px ${TITLE_FONT}`;
        ctx.fillText("Find it", 52, 236);
        let y = 306;
        book.links.forEach((link) => {
          ctx.font = `600 11px ${LABEL_FONT}`;
          ctx.letterSpacing = "2px";
          ctx.fillStyle = accentInk;
          ctx.fillText(link.label.toUpperCase(), 54, y);
          ctx.letterSpacing = "0px";
          ctx.fillStyle = ink;
          y = body(hostLabel(link.href), y + 30, 2, 17, 24) + 26;
        });
      } else {
        label("COLOPHON", 164);
        ctx.fillStyle = ink;
        drawFittedTitle(ctx, book.title, 54, 240, logicalWidth - 108, { maxSize: 32, minSize: 22, maxLines: 2 });
        body(book.tags.join(" · "), 306, 6, 17, 26);
      }

      ctx.globalAlpha = 0.62;
      ctx.fillRect(48, logicalHeight - 48, logicalWidth - 96, 1);
      ctx.globalAlpha = 1;
      const texture = configureCanvasTexture(new THREE.CanvasTexture(pageCanvas));
      texture.name = `${book.id}-interior-page-${pageIndex + 1}`;
      return texture;
    });
  }

  function makeContactShadowTexture() {
    if (sharedContactShadowTexture) return sharedContactShadowTexture;
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext("2d");
    const gradient = ctx.createRadialGradient(256, 64, 10, 256, 64, 254);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.38, "rgba(255,255,255,0.62)");
    gradient.addColorStop(0.72, "rgba(255,255,255,0.18)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    sharedContactShadowTexture = configureCanvasTexture(
      new THREE.CanvasTexture(shadowCanvas),
      { color: false }
    );
    sharedContactShadowTexture.name = "soft-contact-shadow";
    return sharedContactShadowTexture;
  }

  function makePageEdgeTextures() {
    if (sharedPageEdgeTextures) return sharedPageEdgeTextures;

    const makeEdgeTexture = (width, height, suffix) => {
      const edgeCanvas = document.createElement("canvas");
      edgeCanvas.width = width;
      edgeCanvas.height = height;
      const ctx = edgeCanvas.getContext("2d");
      const random = seededRandom(hashSeed(`portfolio-${suffix}`));

      ctx.fillStyle = "#dcd5c7";
      ctx.fillRect(0, 0, width, height);

      const pageStep = suffix === "fore-edge" ? 2 : 1.35;
      for (let y = 0; y < height; y += pageStep) {
        const shade = Math.round(106 + random() * 74);
        const signature = random() > 0.965;
        ctx.strokeStyle = `rgba(${shade},${shade - 3},${shade - 9},${signature ? 0.34 : 0.13 + random() * 0.13})`;
        ctx.lineWidth = signature ? 1.05 : 0.42 + random() * 0.42;
        ctx.beginPath();
        ctx.moveTo(0, y + (random() - 0.5) * 0.5);
        ctx.bezierCurveTo(
          width * 0.3,
          y + (random() - 0.5) * 0.9,
          width * 0.72,
          y + (random() - 0.5) * 0.9,
          width,
          y + (random() - 0.5) * 0.5
        );
        ctx.stroke();
      }

      const edgeShade = ctx.createLinearGradient(0, 0, width, 0);
      edgeShade.addColorStop(0, "rgba(58,48,35,0.18)");
      edgeShade.addColorStop(0.035, "rgba(255,255,255,0.04)");
      edgeShade.addColorStop(0.86, "rgba(255,255,255,0)");
      edgeShade.addColorStop(1, "rgba(58,48,35,0.12)");
      ctx.fillStyle = edgeShade;
      ctx.fillRect(0, 0, width, height);

      return configureCanvasTexture(new THREE.CanvasTexture(edgeCanvas));
    };

    /* 1024-long edges (was 2048): pages are at most a few hundred pixels on screen */
    sharedPageEdgeTextures = {
      fore: makeEdgeTexture(256, 1024, "fore-edge"),
      headTail: makeEdgeTexture(1024, 192, "head-tail-edge")
    };
    return sharedPageEdgeTextures;
  }

  function createRoundedPlaneGeometry(width, height, radius) {
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const corner = Math.min(radius, halfWidth, halfHeight);
    const shape = new THREE.Shape();

    shape.moveTo(-halfWidth + corner, -halfHeight);
    shape.lineTo(halfWidth - corner, -halfHeight);
    shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + corner);
    shape.lineTo(halfWidth, halfHeight - corner);
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - corner, halfHeight);
    shape.lineTo(-halfWidth + corner, halfHeight);
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - corner);
    shape.lineTo(-halfWidth, -halfHeight + corner);
    shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + corner, -halfHeight);

    const geometry = new THREE.ShapeGeometry(shape, 8);
    const positionAttribute = geometry.getAttribute("position");
    const uv = new Float32Array(positionAttribute.count * 2);
    for (let index = 0; index < positionAttribute.count; index += 1) {
      uv[index * 2] = (positionAttribute.getX(index) + halfWidth) / width;
      uv[index * 2 + 1] = (positionAttribute.getY(index) + halfHeight) / height;
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geometry.computeVertexNormals();
    return geometry;
  }

  function createPageBlockGeometry(width, height, depth, radius) {
    const geometry = new RoundedBoxGeometry(width, height, depth, 4, radius);
    const positionAttribute = geometry.getAttribute("position");
    const halfWidth = width * 0.5;

    for (let index = 0; index < positionAttribute.count; index += 1) {
      const x = positionAttribute.getX(index);
      const z = positionAttribute.getZ(index);
      const normalizedX = clamp((x + halfWidth) / width, 0, 1);
      const gutterProgress = clamp(normalizedX / 0.16, 0, 1);
      const gutterEase = gutterProgress * gutterProgress * (3 - 2 * gutterProgress);
      const gutterCompression = (1 - gutterEase) * 0.012;
      const foreEdgeCharacter = Math.pow(normalizedX, 8) * Math.sin(positionAttribute.getY(index) * 31) * 0.00055;
      const adjustedZ = Math.sign(z || 1) * Math.max(
        0,
        Math.abs(z) - gutterCompression + foreEdgeCharacter
      );
      positionAttribute.setZ(index, adjustedZ);
    }

    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }

  function makeSpineTexture(book) {
    const { element, ctx, width, height } = makeCanvas(256, 1024);
    const random = seededRandom(hashSeed(`${book.id}-spine-cloth`) + book.seed);
    ctx.fillStyle = book.color;
    ctx.fillRect(0, 0, width, height);

    const shade = ctx.createLinearGradient(0, 0, width, 0);
    shade.addColorStop(0, "rgba(0,0,0,0.2)");
    shade.addColorStop(0.14, "rgba(255,255,255,0.055)");
    shade.addColorStop(0.62, "rgba(255,255,255,0.012)");
    shade.addColorStop(1, "rgba(0,0,0,0.16)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);

    for (let thread = 0; thread < 900; thread += 1) {
      const x = random() * width;
      const y = random() * height;
      const vertical = random() > 0.42;
      ctx.strokeStyle = random() > 0.5
        ? `rgba(255,255,255,${0.018 + random() * 0.038})`
        : `rgba(0,0,0,${0.018 + random() * 0.032})`;
      ctx.lineWidth = 0.45 + random() * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        vertical ? x + (random() - 0.5) * 1.2 : x + 6 + random() * 18,
        vertical ? y + 6 + random() * 22 : y + (random() - 0.5) * 1.2
      );
      ctx.stroke();
    }

    const bottomShade = ctx.createLinearGradient(0, height * 0.82, 0, height);
    bottomShade.addColorStop(0, "rgba(0,0,0,0)");
    bottomShade.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = bottomShade;
    ctx.fillRect(0, 0, width, height);

    return configureCanvasTexture(new THREE.CanvasTexture(element));
  }

  function makeSpineFoilTexture(book) {
    const { element, ctx, width, height } = makeCanvas(256, 1024);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(22, 26, width - 44, height - 52);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 16px ${LABEL_FONT}`;
    ctx.letterSpacing = "3px";
    ctx.fillText(pad(book.number), width * 0.5, 80);

    ctx.save();
    ctx.translate(width * 0.5, height * 0.5);
    ctx.rotate(Math.PI / 2);
    ctx.letterSpacing = "0px";
    const available = height - 260;
    let size = 46;
    ctx.font = `500 ${size}px ${TITLE_FONT}`;
    while (size > 22 && ctx.measureText(book.title).width > available) {
      size -= 2;
      ctx.font = `500 ${size}px ${TITLE_FONT}`;
    }
    let spineTitle = book.title;
    while (ctx.measureText(spineTitle).width > available && spineTitle.length > 4) {
      spineTitle = `${spineTitle.slice(0, -2).trimEnd()}…`;
    }
    ctx.fillText(spineTitle, 0, 0);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(width * 0.5, height - 80, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.5 - 16, height - 80);
    ctx.lineTo(width * 0.5 + 16, height - 80);
    ctx.stroke();

    return configureCanvasTexture(new THREE.CanvasTexture(element));
  }

  function makeBackCoverTexture(book) {
    const { element, ctx, width, height } = makeCanvas(768, 1152);
    const random = seededRandom(hashSeed(`${book.id}-back-cloth`) + book.seed);

    ctx.fillStyle = book.color;
    ctx.fillRect(0, 0, width, height);

    const edgeShade = ctx.createLinearGradient(0, 0, width, 0);
    edgeShade.addColorStop(0, "rgba(0,0,0,0.15)");
    edgeShade.addColorStop(0.05, "rgba(255,255,255,0.028)");
    edgeShade.addColorStop(0.84, "rgba(255,255,255,0)");
    edgeShade.addColorStop(1, "rgba(0,0,0,0.11)");
    ctx.fillStyle = edgeShade;
    ctx.fillRect(0, 0, width, height);

    for (let thread = 0; thread < 2600; thread += 1) {
      const x = random() * width;
      const y = random() * height;
      const length = 5 + random() * 30;
      ctx.strokeStyle = random() > 0.5
        ? `rgba(255,255,255,${0.018 + random() * 0.03})`
        : `rgba(0,0,0,${0.016 + random() * 0.028})`;
      ctx.lineWidth = 0.45 + random() * 0.65;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + (random() - 0.5) * 1.5);
      ctx.stroke();
    }

    const vignette = ctx.createRadialGradient(
      width * 0.62,
      height * 0.38,
      20,
      width * 0.62,
      height * 0.38,
      width * 0.75
    );
    vignette.addColorStop(0, "rgba(255,255,255,0.03)");
    vignette.addColorStop(1, "rgba(0,0,0,0.09)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    return configureCanvasTexture(new THREE.CanvasTexture(element));
  }

  function makeBackFoilTexture(book) {
    const { element, ctx, width, height } = makeCanvas(768, 1152);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.font = `600 16px ${LABEL_FONT}`;
    ctx.letterSpacing = "3px";
    ctx.fillText(`PROJECT  /  ${pad(book.number)}`, 68, 82);
    ctx.globalAlpha = 0.72;
    ctx.fillRect(68, 108, 176, 2);
    ctx.globalAlpha = 1;

    ctx.lineWidth = 1.5;
    for (let ring = 0; ring < 5; ring += 1) {
      ctx.globalAlpha = 0.24 - ring * 0.032;
      ctx.beginPath();
      ctx.arc(548, 374, 74 + ring * 38, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(348, 374);
    ctx.lineTo(704, 374);
    ctx.moveTo(548, 174);
    ctx.lineTo(548, 574);
    ctx.stroke();

    ctx.letterSpacing = "0px";
    drawFittedTitle(ctx, book.title, 68, 956, width - 136, { maxSize: 62, minSize: 30, maxLines: 3 });
    ctx.font = `600 15px ${LABEL_FONT}`;
    ctx.letterSpacing = "2.6px";
    ctx.fillText(book.tags.slice(0, 3).join("  ·  ").toUpperCase(), 70, 1004);
    ctx.globalAlpha = 0.68;
    ctx.fillRect(68, 1040, 632, 1.5);
    ctx.globalAlpha = 1;
    ctx.textAlign = "right";
    ctx.fillText("SELECTED WORK", 700, 1080);

    return configureCanvasTexture(new THREE.CanvasTexture(element));
  }

  function createMesh(geometry, material, name, cast = true, receive = true) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = cast && tier.shadows;
    mesh.receiveShadow = receive && tier.shadows;
    return mesh;
  }

  function addTurnIns(pivot, book, side, width, height, insideZ, material, internals) {
    const stripDepth = 0.002;
    const border = 0.018;
    const longWidth = width - border * 0.7;
    const longHeight = height - border * 2.2;
    const definitions = [
      ["head", width * 0.5, height * 0.5 - border * 0.56, longWidth, border, stripDepth],
      ["tail", width * 0.5, -height * 0.5 + border * 0.56, longWidth, border, stripDepth],
      ["spine", border * 0.56, 0, border, longHeight, stripDepth],
      ["fore", width - border * 0.56, 0, border, longHeight, stripDepth]
    ];

    definitions.forEach(([edge, x, y, stripWidth, stripHeight, depth]) => {
      const strip = createMesh(
        shared.box,
        material,
        `${book.id}-${side}-turn-in-${edge}`,
        false,
        true
      );
      strip.scale.set(stripWidth, stripHeight, depth);
      strip.position.set(x, y, insideZ);
      pivot.add(strip);
      internals.push(strip);
    });
  }

  function createBookRig(book, index) {
    const root3d = new THREE.Group();
    root3d.name = `book-${book.id}`;
    root3d.userData.index = index;

    const motion = new THREE.Group();
    motion.name = `${book.id}-motion`;
    root3d.add(motion);

    const width = book.width;
    const height = book.height;
    const depth = book.depth;
    const board = 0.032;
    const coverRadius = 0.0045;
    const pageRadius = 0.0025;
    const spineRadius = 0.0015;
    const spineBoardThickness = 0.014;
    const spineWidth = 0.082;
    const pageWidth = width - 0.074;
    const pageHeight = height - 0.068;
    const pageDepth = depth - 0.026;
    /* Everything hidden inside a closed book; drawn only when the cover can open */
    const internals = [];

    const coverTexture = makeCoverTexture(book);
    const foilTexture = makeFoilTexture(book);
    const clothBumpTexture = makeClothBumpTexture();
    const clothSurfaceMaps = makeClothSurfaceMaps();
    const paperFaceTexture = makePaperFaceTexture();
    const pageEdgeTextures = makePageEdgeTextures();
    const spineTexture = makeSpineTexture(book);
    const spineFoilTexture = makeSpineFoilTexture(book);
    const darkFoil = new THREE.Color(book.foil).getHSL({ h: 0, s: 0, l: 0 }).l < 0.2;
    const cloth = clothMaterial({
      color: book.color,
      normalMap: clothSurfaceMaps.normal,
      normalScale: new THREE.Vector2(0.34, 0.34),
      roughnessMap: clothSurfaceMaps.roughness,
      roughness: 0.98,
      metalness: 0.02,
      bumpMap: clothBumpTexture,
      bumpScale: 0.0045,
      sheen: 0.34,
      sheenRoughness: 0.76,
      sheenColor: new THREE.Color(book.foil),
      transparent: true
    });
    const coverArt = clothMaterial({
      map: coverTexture,
      normalMap: clothSurfaceMaps.normal,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughnessMap: clothSurfaceMaps.roughness,
      bumpMap: clothBumpTexture,
      bumpScale: 0.0035,
      roughness: 0.92,
      metalness: 0.035,
      clearcoat: 0.06,
      clearcoatRoughness: 0.72,
      sheen: 0.26,
      sheenRoughness: 0.78,
      transparent: true
    });
    /* The foil's own alpha doubles as its emboss map (was a second copy per surface) */
    const foilArt = clothMaterial({
      color: book.foil,
      map: foilTexture,
      alphaMap: foilTexture,
      bumpMap: foilTexture,
      bumpScale: 0.016,
      roughness: darkFoil ? 0.22 : 0.2,
      metalness: darkFoil ? 0.34 : 0.94,
      clearcoat: 0.18,
      clearcoatRoughness: 0.12,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2
    });
    const spineArt = clothMaterial({
      map: spineTexture,
      normalMap: clothSurfaceMaps.normal,
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughnessMap: clothSurfaceMaps.roughness,
      bumpMap: clothBumpTexture,
      bumpScale: 0.004,
      roughness: 0.95,
      metalness: 0.025,
      sheen: 0.27,
      sheenRoughness: 0.78,
      transparent: true,
      side: THREE.DoubleSide
    });
    const spineFoilArt = clothMaterial({
      color: book.foil,
      map: spineFoilTexture,
      alphaMap: spineFoilTexture,
      bumpMap: spineFoilTexture,
      bumpScale: 0.017,
      roughness: 0.19,
      metalness: darkFoil ? 0.34 : 0.92,
      clearcoat: 0.16,
      clearcoatRoughness: 0.13,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      side: THREE.DoubleSide
    });
    /* Back cover art is built on first inspection; until then it is plain cloth */
    const backArt = clothMaterial({
      color: book.color,
      normalMap: clothSurfaceMaps.normal,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughnessMap: clothSurfaceMaps.roughness,
      bumpMap: clothBumpTexture,
      bumpScale: 0.0035,
      roughness: 0.96,
      metalness: 0.025,
      sheen: 0.25,
      sheenRoughness: 0.8,
      transparent: true,
      side: THREE.DoubleSide
    });
    const backFoilArt = clothMaterial({
      color: book.foil,
      bumpScale: 0.016,
      roughness: 0.21,
      metalness: darkFoil ? 0.34 : 0.9,
      clearcoat: 0.14,
      clearcoatRoughness: 0.14,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      side: THREE.DoubleSide
    });
    const endpaperMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(book.palette.paperPale).lerp(new THREE.Color(0xf2ead8), 0.5),
      map: paperFaceTexture,
      bumpMap: paperFaceTexture,
      bumpScale: 0.0018,
      roughness: 0.94,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: true
    });
    const foreEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: pageEdgeTextures.fore,
      bumpMap: pageEdgeTextures.fore,
      bumpScale: 0.0022,
      roughness: 0.93,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: true
    });
    const headTailEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: pageEdgeTextures.headTail,
      bumpMap: pageEdgeTextures.headTail,
      bumpScale: 0.0015,
      roughness: 0.94,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: true
    });
    const grooveMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(book.color).multiplyScalar(0.42),
      roughness: 0.9,
      metalness: 0,
      bumpMap: clothBumpTexture,
      bumpScale: 0.006,
      side: THREE.DoubleSide,
      transparent: true
    });
    const pageMaterial = createFadeMaterial(shared.page);
    const headbandMaterial = createFadeMaterial(shared.headband);
    /* Interior pages start blank and are printed on first inspection */
    const interiorPageMaterials = Array.from({ length: 8 }, () => {
      const material = createFadeMaterial(shared.pageSheet);
      material.map = paperFaceTexture;
      material.bumpMap = paperFaceTexture;
      material.bumpScale = 0.0012;
      material.roughness = 0.96;
      material.side = THREE.FrontSide;
      material.needsUpdate = true;
      return material;
    });
    const blankPageMaterial = createFadeMaterial(shared.pageSheet);
    blankPageMaterial.map = paperFaceTexture;
    blankPageMaterial.bumpMap = paperFaceTexture;
    blankPageMaterial.bumpScale = 0.0012;
    blankPageMaterial.roughness = 0.96;
    blankPageMaterial.side = THREE.FrontSide;
    blankPageMaterial.needsUpdate = true;
    const signatureMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8d816f).lerp(new THREE.Color(book.palette.paperPale), 0.34),
      roughness: 0.98,
      metalness: 0,
      transparent: true
    });
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(book.foil).lerp(new THREE.Color(book.color), 0.28),
      roughness: 0.62,
      metalness: 0.08,
      side: THREE.DoubleSide,
      transparent: true
    });

    pageMaterial.map = paperFaceTexture;
    pageMaterial.bumpMap = paperFaceTexture;
    pageMaterial.bumpScale = 0.0014;
    pageMaterial.roughness = 0.95;
    pageMaterial.needsUpdate = true;

    const coverGeometry = new RoundedBoxGeometry(width, height, board, 2, coverRadius);
    const pageGeometry = createPageBlockGeometry(pageWidth, pageHeight, pageDepth, pageRadius);
    const coverSurfaceGeometry = createRoundedPlaneGeometry(width - 0.007, height - 0.007, 0.0035);
    const endpaperGeometry = createRoundedPlaneGeometry(width - 0.045, height - 0.045, 0.003);

    const pageBlock = createMesh(pageGeometry, pageMaterial, `${book.id}-page-block`);
    pageBlock.position.x = 0.018;
    motion.add(pageBlock);

    const backPivot = new THREE.Group();
    backPivot.name = `${book.id}-back-cover-pivot`;
    backPivot.position.set(-width * 0.5, 0, -depth * 0.5 - board * 0.5);
    const backCover = createMesh(coverGeometry, cloth, `${book.id}-back-cover`);
    backCover.position.x = width * 0.5;
    backPivot.add(backCover);

    const backPlane = createMesh(coverSurfaceGeometry, backArt, `${book.id}-back-cover-art`, false, false);
    backPlane.position.set(width * 0.5, 0, -board * 0.55);
    backPlane.rotation.y = Math.PI;
    backPivot.add(backPlane);
    internals.push(backPlane);

    const backFoilPlane = createMesh(coverSurfaceGeometry, backFoilArt, `${book.id}-back-foil-art`, false, false);
    backFoilPlane.position.set(width * 0.5, 0, -board * 0.605);
    backFoilPlane.rotation.y = Math.PI;
    backFoilPlane.visible = false;
    backPivot.add(backFoilPlane);

    const backEndpaper = createMesh(endpaperGeometry, endpaperMaterial, `${book.id}-back-endpaper`, false, true);
    backEndpaper.position.set(width * 0.5, 0, board * 0.515);
    backPivot.add(backEndpaper);
    internals.push(backEndpaper);
    addTurnIns(backPivot, book, "back", width, height, board * 0.53, cloth, internals);

    const backGroove = createMesh(shared.plane, grooveMaterial, `${book.id}-back-hinge-groove`, false, false);
    backGroove.scale.set(0.012, height * 0.94, 1);
    backGroove.position.set(0.038, 0, -board * 0.535);
    backGroove.rotation.y = Math.PI;
    backPivot.add(backGroove);
    internals.push(backGroove);
    motion.add(backPivot);

    const frontPivot = new THREE.Group();
    frontPivot.name = `${book.id}-front-cover-pivot`;
    frontPivot.position.set(-width * 0.5, 0, depth * 0.5 + board * 0.5);
    const frontCover = createMesh(coverGeometry, cloth, `${book.id}-front-cover`);
    frontCover.position.x = width * 0.5;
    frontPivot.add(frontCover);

    const coverPlane = createMesh(coverSurfaceGeometry, coverArt, `${book.id}-cover-art`, false, false);
    coverPlane.position.set(width * 0.5, 0, board * 0.55);
    frontPivot.add(coverPlane);

    const foilPlane = createMesh(coverSurfaceGeometry, foilArt, `${book.id}-foil-art`, false, false);
    foilPlane.position.set(width * 0.5, 0, board * 0.605);
    frontPivot.add(foilPlane);

    const frontEndpaper = createMesh(endpaperGeometry, endpaperMaterial, `${book.id}-front-endpaper`, false, true);
    frontEndpaper.position.set(width * 0.5, 0, -board * 0.515);
    frontEndpaper.rotation.y = Math.PI;
    frontPivot.add(frontEndpaper);
    internals.push(frontEndpaper);
    addTurnIns(frontPivot, book, "front", width, height, -board * 0.53, cloth, internals);

    const frontGroove = createMesh(shared.plane, grooveMaterial, `${book.id}-front-hinge-groove`, false, false);
    frontGroove.scale.set(0.012, height * 0.94, 1);
    frontGroove.position.set(0.038, 0, board * 0.655);
    frontPivot.add(frontGroove);
    motion.add(frontPivot);

    const pagePivots = [];
    const pageSurfaces = [];
    for (let pageIndex = 0; pageIndex < 6; pageIndex += 1) {
      const leafOrder = 5 - pageIndex;
      const frontPageMaterial = leafOrder < 4
        ? interiorPageMaterials[leafOrder * 2]
        : blankPageMaterial;
      const backPageMaterial = leafOrder < 4
        ? interiorPageMaterials[leafOrder * 2 + 1]
        : blankPageMaterial;
      const pagePivot = new THREE.Group();
      pagePivot.name = `${book.id}-page-${pageIndex}`;
      pagePivot.position.set(
        -width * 0.5 + spineWidth * 0.65,
        0,
        pageDepth * 0.5 + 0.0015 + pageIndex * 0.0015
      );
      pagePivot.userData.restZ = pagePivot.position.z;
      pagePivot.userData.turnedZ = depth * 0.5 + board + 0.004 + leafOrder * 0.0015;
      const frontPageGeometry = new THREE.PlaneGeometry(1, 1, FLEXIBLE_PAGE_SEGMENTS, FLEXIBLE_PAGE_VERTICAL_SEGMENTS);
      const backPageGeometry = new THREE.PlaneGeometry(1, 1, FLEXIBLE_PAGE_SEGMENTS, FLEXIBLE_PAGE_VERTICAL_SEGMENTS);
      const visiblePageWidth = pageWidth - spineWidth * 0.42;
      const frontPage = createMesh(frontPageGeometry, frontPageMaterial, `${book.id}-page-sheet-${pageIndex}-front`, false, true);
      frontPage.scale.set(visiblePageWidth, pageHeight - 0.014, 1);
      frontPage.position.set(visiblePageWidth * 0.5, 0, 0.00022);
      pagePivot.add(frontPage);
      pageSurfaces.push(frontPage);

      const backPage = createMesh(backPageGeometry, backPageMaterial, `${book.id}-page-sheet-${pageIndex}-back`, false, true);
      backPage.scale.set(visiblePageWidth, pageHeight - 0.014, 1);
      backPage.position.set(visiblePageWidth * 0.5, 0, -0.00022);
      backPage.rotation.y = Math.PI;
      pagePivot.add(backPage);
      pageSurfaces.push(backPage);
      pagePivot.userData.flex = {
        curve: 0,
        curveVelocity: 0,
        twist: 0,
        twistVelocity: 0,
        surfaces: [
          {
            geometry: frontPageGeometry,
            position: frontPageGeometry.attributes.position,
            base: Float32Array.from(frontPageGeometry.attributes.position.array),
            direction: 1
          },
          {
            geometry: backPageGeometry,
            position: backPageGeometry.attributes.position,
            base: Float32Array.from(backPageGeometry.attributes.position.array),
            direction: -1
          }
        ]
      };
      motion.add(pagePivot);
      pagePivots.push(pagePivot);
      internals.push(pagePivot);
    }

    const spineGeometry = new RoundedBoxGeometry(spineBoardThickness, height - 0.012, depth + board * 1.88, 1, spineRadius);
    const spine = createMesh(spineGeometry, spineArt, `${book.id}-flat-spine`);
    spine.position.x = -width * 0.5 - spineBoardThickness * 0.35;
    motion.add(spine);

    const spineFoil = createMesh(shared.plane, spineFoilArt, `${book.id}-spine-foil`, false, false);
    spineFoil.scale.set(depth + board * 1.82, height - 0.018, 1);
    spineFoil.rotation.y = -Math.PI * 0.5;
    spineFoil.position.set(spine.position.x - spineBoardThickness * 0.505, 0, 0);
    motion.add(spineFoil);

    const spineLining = createMesh(
      new RoundedBoxGeometry(spineWidth * 0.68, height - 0.056, Math.max(0.045, pageDepth - 0.008), 1, 0.0015),
      endpaperMaterial,
      `${book.id}-spine-lining`
    );
    spineLining.position.set(-width * 0.5 + spineWidth * 0.38, 0, 0);
    motion.add(spineLining);
    internals.push(spineLining);

    const headbandGeometry = new THREE.CylinderGeometry(0.012, 0.012, pageDepth * 0.88, 12, 1, false);
    [-1, 1].forEach((direction) => {
      const headband = createMesh(headbandGeometry, headbandMaterial, `${book.id}-headband-${direction}`);
      headband.rotation.x = Math.PI * 0.5;
      headband.position.set(-pageWidth * 0.5 + 0.046, direction * (pageHeight * 0.5 - 0.004), 0);
      motion.add(headband);
      internals.push(headband);
    });

    const ribbonGeometry = createRoundedPlaneGeometry(0.034, pageHeight * 0.76, 0.002);
    const ribbon = createMesh(ribbonGeometry, ribbonMaterial, `${book.id}-ribbon-bookmark`, false, true);
    ribbon.position.set(-pageWidth * 0.5 + 0.09 + (book.seed % 3) * 0.018, -pageHeight * 0.17, pageDepth * 0.5 + 0.003);
    ribbon.rotation.z = (book.seed % 2 ? -1 : 1) * 0.014;
    motion.add(ribbon);
    internals.push(ribbon);

    for (let signatureIndex = 0; signatureIndex < 6; signatureIndex += 1) {
      const signature = createMesh(shared.box, signatureMaterial, `${book.id}-page-signature-${signatureIndex + 1}`, false, true);
      signature.scale.set(0.0035, 0.00135, pageDepth * 0.91);
      signature.position.set(0.018 + pageWidth * 0.5 + 0.001, -pageHeight * 0.5 + ((signatureIndex + 1) / 7) * pageHeight, 0);
      motion.add(signature);
      internals.push(signature);
    }

    const foreEdge = createMesh(shared.plane, foreEdgeMaterial, `${book.id}-fore-edge`, false, true);
    foreEdge.scale.set(pageDepth * 0.94, pageHeight - 0.028, 1);
    foreEdge.rotation.y = Math.PI * 0.5;
    foreEdge.position.set(0.018 + pageWidth * 0.5 + 0.002, 0, 0);
    motion.add(foreEdge);

    [-1, 1].forEach((direction) => {
      const edge = createMesh(shared.plane, headTailEdgeMaterial, `${book.id}-${direction > 0 ? "head" : "tail"}-edge`, false, true);
      edge.scale.set(pageWidth - 0.035, pageDepth * 0.94, 1);
      edge.rotation.x = direction > 0 ? -Math.PI * 0.5 : Math.PI * 0.5;
      edge.position.set(0.018, direction * (pageHeight * 0.5 + 0.002), 0);
      motion.add(edge);
    });

    /* Raycast target only: raycasting ignores material visibility, so it never draws */
    const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const hit = createMesh(shared.box, hitMaterial, `${book.id}-hit-target`, false, false);
    hit.scale.set(width * 1.34, height * 1.2, Math.max(depth * 4, 1));
    hit.position.set(-spineWidth * 0.18, 0, 0.12);
    hit.userData.index = index;
    motion.add(hit);
    hitTargets.push(hit);

    const contactShadowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(book.palette.shelfDark),
      alphaMap: makeContactShadowTexture(),
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const contactShadow = createMesh(shared.plane, contactShadowMaterial, `${book.id}-contact-shadow`, false, false);
    contactShadow.scale.set(width * 1.22, depth * 2.05, 1);
    contactShadow.rotation.x = -Math.PI * 0.5;
    contactShadow.position.set(0, -height * 0.5 - 0.022, 0.025);
    root3d.add(contactShadow);

    internals.forEach((object) => {
      object.visible = false;
    });

    return {
      data: book,
      root: root3d,
      motion,
      frontPivot,
      frontCover,
      pageBlock,
      pagePivots,
      pageSurfaces,
      pageGestureSurfaces: [...pageSurfaces, pageBlock],
      hit,
      internals,
      internalsVisible: false,
      detailed: false,
      backArt,
      backFoilArt,
      backFoilPlane,
      endpaperMaterial,
      interiorPageMaterials,
      contactShadow,
      opacity: 1,
      fadeMaterials: [
        cloth,
        coverArt,
        foilArt,
        spineArt,
        spineFoilArt,
        backArt,
        backFoilArt,
        endpaperMaterial,
        foreEdgeMaterial,
        headTailEdgeMaterial,
        grooveMaterial,
        pageMaterial,
        ...interiorPageMaterials,
        blankPageMaterial,
        headbandMaterial,
        signatureMaterial,
        ribbonMaterial
      ],
      base: {
        width,
        height,
        depth
      }
    };
  }

  /* Print pages, endpapers and back cover the first time a book is inspected */
  function ensureDetailTextures(rig) {
    if (rig.detailed) return;
    rig.detailed = true;
    const book = rig.data;
    makeInteriorPageTextures(book).forEach((texture, index) => {
      const material = rig.interiorPageMaterials[index];
      material.map = texture;
      material.needsUpdate = true;
    });
    rig.endpaperMaterial.map = makeEndpaperTexture(book);
    rig.endpaperMaterial.needsUpdate = true;
    rig.backArt.map = makeBackCoverTexture(book);
    rig.backArt.color.set(0xffffff);
    rig.backArt.needsUpdate = true;
    const backFoil = makeBackFoilTexture(book);
    rig.backFoilArt.map = backFoil;
    rig.backFoilArt.alphaMap = backFoil;
    rig.backFoilArt.bumpMap = backFoil;
    rig.backFoilArt.needsUpdate = true;
    rig.backFoilPlane.visible = rig.internalsVisible;
  }

  function setInternalsVisible(rig, visible) {
    if (rig.internalsVisible === visible) return;
    rig.internalsVisible = visible;
    rig.internals.forEach((object) => {
      object.visible = visible;
    });
    rig.backFoilPlane.visible = visible && rig.detailed;
  }

  function configureResponsiveTargets() {
    const narrow = viewWidth < 820;
    shelfCameraPosition.set(0, narrow ? 2.02 : 1.92, narrow ? 8.7 : 8.1);
    /* Target sits a little higher than the original so the books clear the section header */
    shelfCameraTarget.set(0, narrow ? 1.72 : 1.66, 0);
    inspectPosition.set(narrow ? 0 : -2.25, narrow ? 2.3 : 1.56, narrow ? 0.15 : 0);
    inspectCameraPosition.set(narrow ? 0 : -0.52, narrow ? 2.46 : 1.78, narrow ? 5.7 : 5.25);
    inspectCameraTarget.copy(inspectPosition);

    if (narrow) {
      detailViewOffsetX = 0;
      detailSafeWidth = viewWidth;
      return;
    }

    const panelBounds = detailPanel.getBoundingClientRect();
    const rootBounds = root.getBoundingClientRect();
    const panelLeft = panelBounds.left - rootBounds.left;
    const safePanelLeft = panelLeft > 0 ? panelLeft : viewWidth * 0.64;
    const gutter = clamp(viewWidth * 0.035, 32, 56);
    detailSafeWidth = Math.max(viewWidth * 0.42, safePanelLeft - gutter);
    const wideLayoutProgress = clamp((viewWidth - 820) / 620, 0, 1);
    const bookCenterRatio = THREE.MathUtils.lerp(0.55, 0.615, wideLayoutProgress);
    const desiredBookCenter = detailSafeWidth * bookCenterRatio;
    detailViewOffsetX = Math.max(0, viewWidth * 0.5 - desiredBookCenter);
  }

  function getInspectScale() {
    if (!activeBook || viewWidth < 820) return 0.82;
    const distance = Math.abs(inspectCameraPosition.z - inspectPosition.z);
    const worldHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const pixelsPerWorld = viewHeight / Math.max(worldHeight, 0.001);
    const estimatedBookWidth = activeBook.base.width * pixelsPerWorld * 1.16;
    const scaleForSafeWidth = (detailSafeWidth * 0.72) / Math.max(estimatedBookWidth, 1);
    return clamp(scaleForSafeWidth, 0.9, 1.32);
  }

  function applyDetailViewOffset() {
    if (Math.abs(currentViewOffsetX) < 0.5) {
      camera.clearViewOffset();
      return;
    }
    camera.setViewOffset(viewWidth, viewHeight, currentViewOffsetX, 0, viewWidth, viewHeight);
  }

  function applyWoodTexture() {
    if (!woodImage || !renderer) return;
    const woodMap = new THREE.Texture(woodImage);
    woodMap.name = "editorial-walnut";
    woodMap.colorSpace = THREE.SRGBColorSpace;
    woodMap.wrapS = THREE.RepeatWrapping;
    woodMap.wrapT = THREE.RepeatWrapping;
    woodMap.repeat.set(7, 1.65);
    woodMap.center.set(0.5, 0.5);
    woodMap.rotation = Math.PI * 0.5;
    woodMap.anisotropy = Math.min(tier.anisotropy, renderer.capabilities.getMaxAnisotropy());
    woodMap.needsUpdate = true;

    /* Both walnut materials sample the same texture (was two uploads) */
    shared.walnut.map = woodMap;
    shared.walnut.needsUpdate = true;
    shared.walnutDark.map = woodMap;
    shared.walnutDark.needsUpdate = true;
    requestFrame();
  }

  function addRoom() {
    const floor = createMesh(shared.plane, new THREE.MeshStandardMaterial({
      color: SHELF_THEME.roomFloor,
      roughness: 0.92,
      metalness: 0
    }), "paper-floor", false, true);
    floor.scale.set(30, 20, 1);
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.y = -0.02;
    scene.add(floor);

    const back = createMesh(shared.plane, new THREE.MeshStandardMaterial({
      color: SHELF_THEME.roomWall,
      roughness: 1,
      metalness: 0
    }), "paper-backdrop", false, true);
    back.scale.set(28, 14, 1);
    back.position.set(0, 5.5, -3.3);
    scene.add(back);

    const shelf = createMesh(shared.box, shared.walnut, "walnut-shelf");
    shelf.scale.set(17, 0.28, 1.08);
    shelf.position.set(0, 0.33, -0.03);
    shelfStage.add(shelf);

    const shelfLip = createMesh(shared.box, shared.walnutDark, "walnut-shelf-lip");
    shelfLip.scale.set(17.05, 0.075, 1.14);
    shelfLip.position.set(0, 0.205, 0.02);
    shelfStage.add(shelfLip);

    const backRail = createMesh(shared.box, shared.walnut, "walnut-back-rail");
    backRail.scale.set(17, 0.17, 0.2);
    backRail.position.set(0, 0.68, -0.52);
    shelfStage.add(backRail);

    [-7.65, 7.65].forEach((x, index) => {
      const upright = createMesh(shared.box, shared.walnutDark, `shelf-upright-${index}`);
      upright.scale.set(0.2, 3.8, 0.72);
      upright.position.set(x, 2.05, -0.28);
      shelfStage.add(upright);
    });

    const shadowStrip = createMesh(shared.plane, new THREE.MeshBasicMaterial({
      color: SHELF_THEME.shelfWoodDark,
      alphaMap: makeContactShadowTexture(),
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    }), "shelf-contact-shadow", false, false);
    shadowStrip.scale.set(16, 0.85, 1);
    shadowStrip.rotation.x = -Math.PI * 0.5;
    shadowStrip.position.set(0, 0.49, 0.06);
    shelfStage.add(shadowStrip);

    roomMaterials.floor = floor.material;
    roomMaterials.wall = back.material;
    roomMaterials.shelf = shared.walnut;
    roomMaterials.shelfDark = shared.walnutDark;
    roomMaterials.shadow = shadowStrip.material;
  }

  /* Hemisphere + shadowed key + fill, plus the two area lights that carry the cloth and
     foil. The original's back, spine and page-edge area lights are folded into a
     slightly brighter hemisphere. */
  async function addLights() {
    roomLights.hemisphere = new THREE.HemisphereLight(0xfff8e8, 0x5b4030, tier.areaLights ? 0.64 : 0.78);
    scene.add(roomLights.hemisphere);

    const key = new THREE.DirectionalLight(SHELF_THEME.keyLight, tier.areaLights ? 1.42 : 1.7);
    key.name = "shadow-key";
    key.position.set(-4.6, 7.4, 5.8);
    if (tier.shadows) {
      key.castShadow = true;
      key.shadow.mapSize.set(tier.shadowMapSize, tier.shadowMapSize);
      key.shadow.camera.left = -6;
      key.shadow.camera.right = 6;
      key.shadow.camera.top = 6;
      key.shadow.camera.bottom = -1.5;
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 18;
      key.shadow.bias = -0.00018;
      key.shadow.normalBias = 0.018;
      key.shadow.radius = 3.5;
    }
    scene.add(key);
    roomLights.key = key;

    const fill = new THREE.DirectionalLight(SHELF_THEME.fillLight, 0.34);
    fill.name = "cool-fill";
    fill.position.set(5.5, 3.6, 4.2);
    scene.add(fill);
    roomLights.fill = fill;

    if (tier.areaLights) {
      const { RectAreaLightUniformsLib } = await import("three/addons/lights/RectAreaLightUniformsLib.js");
      RectAreaLightUniformsLib.init();

      const softKey = new THREE.RectAreaLight(SHELF_THEME.keyLight, 5.8, 4.8, 5.6);
      softKey.name = "cloth-softbox";
      softKey.position.set(-3.2, 5.5, 4.6);
      softKey.lookAt(0, 1.45, 0);
      scene.add(softKey);
      roomLights.softKey = softKey;

      const rim = new THREE.RectAreaLight(SHELF_THEME.accent, 3.45, 1.6, 4.8);
      rim.name = "foil-rake";
      rim.position.set(3.8, 3.6, -2.1);
      rim.lookAt(-0.2, 1.5, 0);
      scene.add(rim);
      roomLights.rim = rim;
    } else {
      const rim = new THREE.DirectionalLight(SHELF_THEME.accent, 0.5);
      rim.name = "foil-rake";
      rim.position.set(3.8, 3.6, -2.1);
      scene.add(rim);
      roomLights.rim = rim;
    }
  }

  /* Static dust: kept for depth, no longer animated (that forced a render every frame) */
  function addDust() {
    const dustCount = 110;
    const positions = new Float32Array(dustCount * 3);
    const random = seededRandom(20260728);
    for (let index = 0; index < dustCount; index += 1) {
      positions[index * 3] = (random() - 0.5) * 14;
      positions[index * 3 + 1] = 0.7 + random() * 4.7;
      positions[index * 3 + 2] = -1.7 + random() * 4;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xc3a97b,
      size: 0.014,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const dust = new THREE.Points(geometry, material);
    dust.name = "paper-dust";
    scene.add(dust);
  }

  function buildMarkers() {
    BOOKS.forEach((book, index) => {
      const button = document.createElement("button");
      button.className = "marker";
      button.type = "button";
      button.role = "tab";
      button.setAttribute("aria-label", `Select project ${index + 1}: ${book.title}`);
      button.setAttribute("aria-current", index === 0 ? "true" : "false");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener("click", () => selectMarker(index, button));
      markers.append(button);
    });
  }

  function setThemeColorsImmediately() {
    roomMaterials.floor?.color.copy(themeTargets.floor);
    roomMaterials.wall?.color.copy(themeTargets.wall);
    roomMaterials.shelf?.color.copy(themeTargets.shelf);
    roomMaterials.shelfDark?.color.copy(themeTargets.shelfDark);
    roomMaterials.shadow?.color.copy(themeTargets.shadow);
    scene?.fog?.color.copy(themeTargets.fog);
    roomLights.hemisphere?.color.copy(themeTargets.hemisphere);
    roomLights.hemisphere?.groundColor.copy(themeTargets.hemisphereGround);
    roomLights.key?.color.copy(themeTargets.key);
    roomLights.softKey?.color.copy(themeTargets.key);
    roomLights.fill?.color.copy(themeTargets.fill);
    roomLights.rim?.color.copy(themeTargets.rim);
    themeMoving = false;
  }

  function applyBookTheme(book) {
    const palette = book.palette;
    const style = root.style;
    style.setProperty("--paper", palette.paper);
    style.setProperty("--paper-deep", palette.paperDeep);
    style.setProperty("--paper-pale", palette.paperPale);
    style.setProperty("--ink", palette.ink);
    style.setProperty("--ink-soft", palette.inkSoft);
    style.setProperty("--walnut", palette.shelf);
    style.setProperty("--walnut-deep", palette.shelfDark);
    style.setProperty("--rule", `color-mix(in srgb, ${palette.ink} 24%, transparent)`);

    themeTargets.floor.set(palette.paperDeep);
    themeTargets.wall.set(palette.wall);
    themeTargets.shelf.set(palette.shelf);
    themeTargets.shelfDark.set(palette.shelfDark);
    themeTargets.shadow.set(palette.shelfDark);
    themeTargets.fog.set(palette.wall);
    themeTargets.hemisphere.set(palette.paperPale);
    themeTargets.hemisphereGround.set(palette.shelf);
    themeTargets.key.set(palette.light);
    themeTargets.fill.set(palette.fill);
    themeTargets.rim.set(book.foil);

    if (!themeInitialized || reducedMotion) {
      themeInitialized = true;
      setThemeColorsImmediately();
    } else {
      themeMoving = true;
      requestFrame();
    }
  }

  function updateTheme(delta) {
    if (!themeMoving) return false;
    const amount = 1 - Math.exp(-delta * 5.5);
    let largestGap = 0;
    const easeColor = (current, target) => {
      if (!current) return;
      const redGap = current.r - target.r;
      const greenGap = current.g - target.g;
      const blueGap = current.b - target.b;
      largestGap = Math.max(largestGap, redGap * redGap + greenGap * greenGap + blueGap * blueGap);
      current.lerp(target, amount);
    };

    easeColor(roomMaterials.floor?.color, themeTargets.floor);
    easeColor(roomMaterials.wall?.color, themeTargets.wall);
    easeColor(roomMaterials.shelf?.color, themeTargets.shelf);
    easeColor(roomMaterials.shelfDark?.color, themeTargets.shelfDark);
    easeColor(roomMaterials.shadow?.color, themeTargets.shadow);
    easeColor(scene?.fog?.color, themeTargets.fog);
    easeColor(roomLights.hemisphere?.color, themeTargets.hemisphere);
    easeColor(roomLights.hemisphere?.groundColor, themeTargets.hemisphereGround);
    easeColor(roomLights.key?.color, themeTargets.key);
    easeColor(roomLights.softKey?.color, themeTargets.key);
    easeColor(roomLights.fill?.color, themeTargets.fill);
    easeColor(roomLights.rim?.color, themeTargets.rim);

    if (largestGap < 0.0000025) {
      setThemeColorsImmediately();
    }
    return themeMoving;
  }

  function updateSelection(index, announce = false, force = false) {
    const nextIndex = clamp(index, 0, lastIndex);
    if (nextIndex === selectedIndex && !announce && !force) return;
    selectedIndex = nextIndex;
    const book = BOOKS[selectedIndex];
    selectionTitle.textContent = book.title;
    selectionNote.textContent = book.tagline || book.description;
    counter.textContent = `${pad(selectedIndex + 1)} / ${pad(BOOKS.length)}`;
    inspectButton.setAttribute("aria-label", `Open ${book.title}`);
    previousButton.disabled = selectedIndex === 0;
    nextButton.disabled = selectedIndex === lastIndex;
    applyBookTheme(book);

    [...markers.children].forEach((marker, markerIndex) => {
      const current = markerIndex === selectedIndex;
      marker.setAttribute("aria-current", current ? "true" : "false");
      marker.setAttribute("aria-selected", current ? "true" : "false");
      marker.tabIndex = current ? 0 : -1;
    });

    if (announce) {
      liveRegion.textContent = `Selected project ${selectedIndex + 1} of ${BOOKS.length}: ${book.title}.`;
    }
  }

  function metaRow(label, content) {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.append(content);
    row.append(term, detail);
    return row;
  }

  /* Only fields the project actually has; role and year are not in the data */
  function populateDetail(book) {
    detailEyebrow.textContent = `Project ${pad(book.number)} / ${pad(BOOKS.length)}`;
    detailTitle.textContent = book.title;
    detailDeck.textContent = book.tagline ? `${book.tagline}. ${book.description}` : book.description;

    const rows = [];
    if (book.tags.length) {
      const list = document.createElement("ul");
      list.className = "tech-list";
      book.tags.forEach((tag) => {
        const item = document.createElement("li");
        item.textContent = tag;
        list.append(item);
      });
      rows.push(metaRow("Tech stack", list));
    }
    if (book.award) rows.push(metaRow("Award", book.award));
    if (book.links.length) {
      const links = document.createElement("div");
      links.className = "link-list";
      book.links.forEach((link) => {
        const anchor = document.createElement("a");
        anchor.href = link.href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = link.label;
        anchor.setAttribute("aria-label", `${link.label}: ${book.title} (opens in a new tab)`);
        links.append(anchor);
      });
      rows.push(metaRow("Links", links));
    }
    detailMeta.replaceChildren(...rows);
    detailMeta.hidden = rows.length === 0;
  }

  function getSpreadLabels() {
    return [
      "Title page",
      "Overview · Plate",
      "Stack · Notes",
      "Links · Plate",
      "Colophon"
    ];
  }

  function updatePageControls(announce = false) {
    const labels = getSpreadLabels();
    const interactionLocked = mode !== "detail" || !readingOpen;
    const previousDisabled = interactionLocked || currentSpread === 0;
    const nextDisabled = interactionLocked || currentSpread === SPREAD_COUNT - 1;

    previousPageButton.disabled = previousDisabled;
    nextPageButton.disabled = nextDisabled;
    pageLabel.textContent = readingOpen ? labels[currentSpread] : "Closed";
    pageCounter.textContent = readingOpen
      ? `${pad(currentSpread + 1)} / ${pad(SPREAD_COUNT)}`
      : "Click book to open";
    toggleBookButton.textContent = readingOpen ? "Close book" : "Open book";
    toggleBookButton.setAttribute("aria-pressed", String(readingOpen));
    detailMicrocopy.textContent = readingOpen
      ? "Drag pages · Drag cover to close · Background to orbit"
      : "Drag cover or click once to open · Background to orbit";
    previousPageButton.setAttribute(
      "aria-label",
      previousDisabled ? "Previous page" : `Previous page: ${labels[currentSpread - 1]}`
    );
    nextPageButton.setAttribute(
      "aria-label",
      nextDisabled ? "Next page" : `Next page: ${labels[currentSpread + 1]}`
    );

    if (announce && activeBook && readingOpen) {
      liveRegion.textContent = `Page ${currentSpread + 1} of ${SPREAD_COUNT}: ${labels[currentSpread]}.`;
    }
  }

  function setReadingOpen(open, announce = true) {
    if (mode !== "detail" || readingOpen === open) return;
    cancelPageDrag();
    readingOpen = open;
    if (!readingOpen) currentSpread = 0;
    canvas.classList.remove("has-page-hover", "has-closed-book-hover");
    updatePageControls(false);
    pointerDirty = true;

    if (announce && activeBook) {
      liveRegion.textContent = readingOpen
        ? `${activeBook.data.title} opened to its title page. Drag a page horizontally or use the arrow controls to read.`
        : `${activeBook.data.title} closed. Drag the cover, click the book, or use Open book to begin reading.`;
    }
    requestFrame();
  }

  function turnPage(direction) {
    if (mode !== "detail" || !readingOpen) return;
    const nextSpread = clamp(currentSpread + direction, 0, SPREAD_COUNT - 1);
    if (nextSpread === currentSpread) return;
    currentSpread = nextSpread;
    updatePageControls(true);
    requestFrame();
  }

  /* damp() that reports whether it is still travelling, so the loop can go idle */
  function settle(current, target, lambda, delta, epsilon = 0.0004) {
    const next = damp(current, target, lambda, delta);
    if (Math.abs(next - target) > epsilon) {
      needsAnotherFrame = true;
      return next;
    }
    return target;
  }

  function updateFlexiblePage(pagePivot, targetCurve, delta, immediate = false, targetTwist = 0) {
    const flex = pagePivot.userData.flex;
    if (!flex) return;
    const settleImmediately = immediate || reducedMotion;
    const step = Math.min(delta, 0.033);
    let nextCurve = targetCurve;
    let nextTwist = targetTwist;

    if (settleImmediately) {
      flex.curveVelocity = 0;
      flex.twistVelocity = 0;
    } else {
      const curveAcceleration = (targetCurve - flex.curve) * 178 - flex.curveVelocity * 19;
      const twistAcceleration = (targetTwist - flex.twist) * 210 - flex.twistVelocity * 21;
      flex.curveVelocity = clamp(flex.curveVelocity + curveAcceleration * step, -1.8, 1.8);
      flex.twistVelocity = clamp(flex.twistVelocity + twistAcceleration * step, -1.6, 1.6);
      nextCurve = clamp(flex.curve + flex.curveVelocity * step, -0.025, 0.19);
      nextTwist = clamp(flex.twist + flex.twistVelocity * step, -0.12, 0.12);

      if (Math.abs(targetCurve - nextCurve) < 0.00002 && Math.abs(flex.curveVelocity) < 0.0008) {
        nextCurve = targetCurve;
        flex.curveVelocity = 0;
      }
      if (Math.abs(targetTwist - nextTwist) < 0.00002 && Math.abs(flex.twistVelocity) < 0.0008) {
        nextTwist = targetTwist;
        flex.twistVelocity = 0;
      }
    }

    if (
      Math.abs(nextCurve - flex.curve) < 0.00001
      && Math.abs(targetCurve - nextCurve) < 0.00001
      && Math.abs(nextTwist - flex.twist) < 0.00001
      && Math.abs(targetTwist - nextTwist) < 0.00001
    ) return;

    if (!settleImmediately) needsAnotherFrame = true;
    flex.curve = nextCurve;
    flex.twist = nextTwist;
    flex.surfaces.forEach((surface) => {
      const { position: positions, base, direction, geometry } = surface;
      for (let vertex = 0; vertex < positions.count; vertex += 1) {
        const offset = vertex * 3;
        const x = base[offset];
        const y = base[offset + 1];
        const u = x + 0.5;
        const mappedU = direction > 0 ? u : 1 - u;
        const arch = Math.sin(Math.PI * mappedU);
        const freeEdgeLift = mappedU * mappedU * 0.16;
        const shape = arch * 0.84 + freeEdgeLift;
        const diagonalTwist = nextTwist * y * Math.pow(mappedU, 1.35);
        const softRipple = nextTwist
          * Math.sin(mappedU * Math.PI * 2)
          * (1 - Math.min(1, Math.abs(y) * 1.65))
          * 0.09;
        const z = (nextCurve * shape * (1 + y * 0.14) + diagonalTwist + softRipple) * direction;
        positions.setXYZ(vertex, x, y, z);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    });
  }

  function updatePaginatedBook(rig, delta, openAmount = 1) {
    const amount = clamp(openAmount, 0, 1);
    const speed = reducedMotion ? 1000 : 10.5;
    const hoverCrack = (mode === "detail" && !readingOpen && detailBookHovered && !reducedMotion) ? -0.16 : 0;
    const coverTarget = amount > 0 ? (-Math.PI + 0.055) * amount : hoverCrack;

    rig.frontPivot.rotation.y = settle(rig.frontPivot.rotation.y, coverTarget, speed, delta);

    rig.pagePivots.forEach((pagePivot, pageIndex) => {
      const leafOrder = rig.pagePivots.length - 1 - pageIndex;
      let pageTarget = 0;
      let positionTarget = pagePivot.userData.restZ;
      let pageTwistTarget = 0;
      let dragCurveBoost = 0;
      let flexTwistTarget = 0;

      if (leafOrder < PAGINATED_LEAF_COUNT) {
        const isTurned = leafOrder < currentSpread;
        const unturnedTarget = -0.038 + leafOrder * 0.008;
        const turnedTarget = -Math.PI + 0.085 + leafOrder * 0.014;
        pageTarget = isTurned ? turnedTarget : unturnedTarget;
        positionTarget = isTurned ? pagePivot.userData.turnedZ : pagePivot.userData.restZ;

        if (pageDrag.active && pageDrag.direction !== 0) {
          const dragLeafOrder = pageDrag.direction > 0 ? currentSpread : currentSpread - 1;
          if (leafOrder === dragLeafOrder) {
            const dragProgress = smoothstep(pageDrag.progress);
            const dragEnvelope = Math.sin(Math.PI * dragProgress);
            const speedResponse = clamp(Math.abs(pageDrag.progressVelocity) / 5.5, 0, 1);
            const signedSpeed = clamp(pageDrag.progressVelocity / 5.5, -1, 1);
            pageTarget = pageDrag.direction > 0
              ? lerp(unturnedTarget, turnedTarget, dragProgress)
              : lerp(turnedTarget, unturnedTarget, dragProgress);
            positionTarget = pageDrag.direction > 0
              ? lerp(pagePivot.userData.restZ, pagePivot.userData.turnedZ, dragProgress)
              : lerp(pagePivot.userData.turnedZ, pagePivot.userData.restZ, dragProgress);
            pageTwistTarget = pageDrag.direction * dragEnvelope * (0.014 + pageDrag.verticalBias * 0.026);
            dragCurveBoost = dragEnvelope * (0.032 + speedResponse * 0.064);
            flexTwistTarget = dragEnvelope * (pageDrag.verticalBias * 0.08 + signedSpeed * pageDrag.direction * 0.03);
          }
        }

        pagePivot.position.z = settle(
          pagePivot.position.z,
          pagePivot.userData.restZ + (positionTarget - pagePivot.userData.restZ) * amount,
          speed,
          delta,
          0.00002
        );
      } else {
        pageTarget = -0.006 + (leafOrder - PAGINATED_LEAF_COUNT) * 0.003;
        pagePivot.position.z = settle(pagePivot.position.z, pagePivot.userData.restZ, speed, delta, 0.00002);
      }

      pagePivot.rotation.y = settle(pagePivot.rotation.y, pageTarget * amount, speed, delta);
      pagePivot.rotation.z = settle(pagePivot.rotation.z, pageTwistTarget * amount, speed, delta);
      const turnProgress = clamp(Math.abs(pagePivot.rotation.y) / Math.PI, 0, 1);
      const curveTarget = amount > 0
        ? amount * (0.004 + Math.sin(Math.PI * turnProgress) * 0.082 + dragCurveBoost)
        : 0;
      updateFlexiblePage(pagePivot, curveTarget, delta, false, flexTwistTarget * amount);
    });
  }

  function selectMarker(index, origin) {
    if (mode !== "hero") return;
    targetPosition = clamp(index, 0, lastIndex);
    focusReturnTarget = origin;
    updateSelection(targetPosition, true);
    requestFrame();
  }

  /* Bounded shelf: the first and last books are real ends, so scroll can hand off */
  function navigate(direction, origin) {
    if (mode !== "hero") return false;
    const next = clamp(Math.round(targetPosition) + direction, 0, lastIndex);
    if (next === Math.round(targetPosition)) return false;
    targetPosition = next;
    focusReturnTarget = origin;
    updateSelection(next, true);
    requestFrame();
    return true;
  }

  function alignShelfToSelection() {
    targetPosition = selectedIndex;
    position = targetPosition;
  }

  /*
   * The original shelf loops, so the selected book is always centred. This one has real
   * ends, so the view centre stops short of them and the first/last books sit off-centre
   * instead of beside an empty half-screen. Selection (lift, scale) still follows the book.
   */
  function viewCenterFor(value) {
    const edge = clamp(halfVisibleBooks - 1.15, 0, lastIndex / 2);
    return clamp(value, edge, lastIndex - edge);
  }

  function shelfSlot(index, at) {
    const offset = index - viewCenterFor(at);
    const distance = Math.abs(offset);
    const focus = 1 - clamp(Math.abs(index - at), 0, 1);
    const fadeStart = Math.max(2.55, halfVisibleBooks);
    return {
      offset,
      focus,
      x: offset * spacing,
      z: 0.13 + focus * 0.24 - Math.min(distance, 2.8) * 0.07,
      rotationY: -offset * 0.105,
      rotationZ: -offset * 0.018,
      opacity: 1 - smoothstep(clamp((distance - fadeStart) / 0.7, 0, 1))
    };
  }

  function snapRigToShelfSlot(rig, index) {
    const slot = shelfSlot(index, position);
    const focus = slot.focus;
    const opacity = slot.opacity;

    rig.root.position.set(
      slot.x,
      shelfBoardTop + rig.base.height * 0.5 + focus * 0.15,
      slot.z
    );
    rig.root.rotation.set(0, slot.rotationY, slot.rotationZ);
    rig.root.scale.setScalar(1 + focus * 0.09);
    rig.motion.position.y = 0;
    rig.motion.rotation.set(0, 0, 0);
    rig.frontPivot.rotation.y = 0;
    rig.pagePivots.forEach((pagePivot) => {
      pagePivot.rotation.y = 0;
      pagePivot.rotation.z = 0;
      pagePivot.position.z = pagePivot.userData.restZ;
      updateFlexiblePage(pagePivot, 0, 0, true);
    });
    setInternalsVisible(rig, false);
    rig.opacity = opacity;
    rig.fadeMaterials.forEach((material) => {
      material.opacity = opacity;
    });
    rig.root.visible = opacity > 0.01;
    rig.contactShadow.visible = true;
    rig.contactShadow.material.opacity = opacity * 0.24;
  }

  function setPointerFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    pointerDirty = true;
  }

  function updateHover() {
    pointerDirty = false;
    if (mode === "detail" && activeBook) {
      setHovered(-1);
      if (readingOpen) {
        detailBookHovered = false;
        canvas.classList.remove("has-closed-book-hover");
        canvas.classList.toggle(
          "has-page-hover",
          pageDrag.active || Boolean(pageSurfaceAtPointer()) || Boolean(coverSurfaceAtPointer())
        );
      } else {
        detailBookHovered = Boolean(coverSurfaceAtPointer());
        canvas.classList.remove("has-page-hover");
        canvas.classList.toggle("has-closed-book-hover", detailBookHovered);
      }
      return;
    }
    detailBookHovered = false;
    canvas.classList.remove("has-page-hover", "has-closed-book-hover");
    if (mode !== "hero") {
      setHovered(-1);
      return;
    }
    setHovered(bookIndexAtPointer());
  }

  function bookIndexAtPointer() {
    raycaster.setFromCamera(pointer.ndc, camera);
    const targets = hitTargets.filter((hit) => bookRigs[hit.userData.index]?.opacity > 0.12);
    const hits = raycaster.intersectObjects(targets, false);
    return hits.length ? hits[0].object.userData.index : -1;
  }

  function activeBookAtPointer() {
    if (mode !== "detail" || !activeBook) return false;
    activeBook.root.updateWorldMatrix(true, true);
    raycaster.setFromCamera(pointer.ndc, camera);
    return raycaster.intersectObject(activeBook.hit, false).length > 0;
  }

  function pageSurfaceAtPointer() {
    if (mode !== "detail" || !activeBook || !readingOpen) return null;
    activeBook.root.updateWorldMatrix(true, true);
    raycaster.setFromCamera(pointer.ndc, camera);
    const hits = raycaster.intersectObjects(activeBook.pageGestureSurfaces, false);
    return hits.length ? hits[0].object : null;
  }

  function coverSurfaceAtPointer() {
    if (mode !== "detail" || !activeBook || currentSpread !== 0) return null;
    activeBook.root.updateWorldMatrix(true, true);
    raycaster.setFromCamera(pointer.ndc, camera);
    const hits = raycaster.intersectObject(activeBook.frontCover, false);
    return hits.length ? hits[0].object : null;
  }

  function resetPageDrag() {
    const capturedPointerId = pageDrag.pointerId;
    pageDrag.active = false;
    pageDrag.pointerId = null;
    pageDrag.progress = 0;
    pageDrag.peakProgress = 0;
    pageDrag.committed = false;
    pageDrag.progressVelocity = 0;
    pageDrag.verticalBias = 0;
    pageDrag.lastProgress = 0;
    pageDrag.lastTime = 0;
    pageDrag.direction = 0;
    pageDrag.kind = null;
    canvas.classList.remove("is-page-dragging");
    if (controls) controls.enabled = mode === "detail";
    if (capturedPointerId !== null && canvas.hasPointerCapture?.(capturedPointerId)) {
      canvas.releasePointerCapture(capturedPointerId);
    }
  }

  function applyPageReleaseImpulse(turnDirection) {
    if (!activeBook || turnDirection === 0) return;
    const leafOrder = turnDirection > 0 ? currentSpread : currentSpread - 1;
    const pageIndex = activeBook.pagePivots.length - 1 - leafOrder;
    const pagePivot = activeBook.pagePivots[pageIndex];
    const flex = pagePivot?.userData.flex;
    if (!flex) return;

    const speedResponse = clamp(Math.abs(pageDrag.progressVelocity) / 5.5, 0.12, 1);
    flex.curveVelocity = clamp(flex.curveVelocity + speedResponse * 0.46, -1.8, 1.8);
    flex.twistVelocity = clamp(
      flex.twistVelocity
        + pageDrag.verticalBias * 0.38
        + clamp(pageDrag.progressVelocity / 5.5, -1, 1) * turnDirection * 0.14,
      -1.6,
      1.6
    );
  }

  function settlePageDrag(commitLatchedGesture = false) {
    if (!pageDrag.active) return false;
    const turnDirection = pageDrag.direction;
    const shouldCloseCover = commitLatchedGesture && pageDrag.kind === "cover-close" && pageDrag.committed;
    const shouldOpenCover = commitLatchedGesture && pageDrag.kind === "cover-open" && pageDrag.committed;
    const shouldTurnPage = commitLatchedGesture && pageDrag.kind === "page" && pageDrag.committed && turnDirection !== 0;
    if (shouldTurnPage) {
      applyPageReleaseImpulse(turnDirection);
    }
    resetPageDrag();
    if (shouldCloseCover) {
      setReadingOpen(false);
    } else if (shouldOpenCover) {
      setReadingOpen(true);
    } else if (shouldTurnPage) {
      turnPage(turnDirection);
    } else {
      requestFrame();
    }
    return shouldCloseCover || shouldOpenCover || shouldTurnPage;
  }

  function cancelPageDrag() {
    settlePageDrag(false);
  }

  function resetDetailPress() {
    detailPress.active = false;
    detailPress.pointerId = null;
    detailPress.moved = false;
    detailPress.allowClick = false;
  }

  function onDetailBookPointerDown(event) {
    if (mode !== "detail" || readingOpen || event.button !== 0 || event.isPrimary === false) return;
    setPointerFromEvent(event);
    detailPress.allowClick = false;
    if (!activeBookAtPointer()) return;
    detailPress.active = true;
    detailPress.pointerId = event.pointerId;
    detailPress.startX = event.clientX;
    detailPress.startY = event.clientY;
    detailPress.moved = false;
  }

  function onDetailBookPointerMove(event) {
    if (!detailPress.active || event.pointerId !== detailPress.pointerId) return;
    if (Math.hypot(event.clientX - detailPress.startX, event.clientY - detailPress.startY) > 16) {
      detailPress.moved = true;
    }
  }

  function onDetailBookPointerEnd(event) {
    if (!detailPress.active || event.pointerId !== detailPress.pointerId) return;
    detailPress.allowClick = event.type === "pointerup" && !detailPress.moved;
    detailPress.active = false;
    detailPress.pointerId = null;
  }

  function onPagePointerDown(event) {
    if (mode !== "detail" || !activeBook || event.button !== 0 || event.isPrimary === false) return;

    setPointerFromEvent(event);
    const coverSurface = coverSurfaceAtPointer();
    const pageSurface = readingOpen ? pageSurfaceAtPointer() : null;
    if (!coverSurface && !pageSurface) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    pageDrag.active = true;
    pageDrag.pointerId = event.pointerId;
    pageDrag.startX = event.clientX;
    pageDrag.startY = event.clientY;
    pageDrag.progress = 0;
    pageDrag.peakProgress = 0;
    pageDrag.committed = false;
    pageDrag.progressVelocity = 0;
    pageDrag.verticalBias = 0;
    pageDrag.lastProgress = 0;
    pageDrag.lastTime = event.timeStamp || performance.now();
    pageDrag.direction = 0;
    pageDrag.kind = coverSurface ? (readingOpen ? "cover-close" : "cover-open") : "page";
    controls.enabled = false;
    canvas.classList.add("has-page-hover", "is-page-dragging");
    canvas.setPointerCapture?.(event.pointerId);
    requestFrame();
  }

  function updatePageDragMotion(event, deltaY) {
    const eventTime = event.timeStamp || performance.now();
    const elapsed = clamp((eventTime - pageDrag.lastTime) / 1000, 0.008, 0.08);
    const instantVelocity = clamp((pageDrag.progress - pageDrag.lastProgress) / elapsed, -8, 8);
    pageDrag.progressVelocity = lerp(pageDrag.progressVelocity, instantVelocity, 0.42);
    pageDrag.verticalBias = lerp(pageDrag.verticalBias, clamp(deltaY / 180, -1, 1), 0.36);
    pageDrag.lastProgress = pageDrag.progress;
    pageDrag.lastTime = eventTime;
  }

  function updatePageDragFromEvent(event) {
    setPointerFromEvent(event);

    const deltaX = event.clientX - pageDrag.startX;
    const deltaY = event.clientY - pageDrag.startY;
    const horizontalDistance = Math.abs(deltaX);

    if (pageDrag.kind === "cover-open" || pageDrag.kind === "cover-close") {
      const openingCover = pageDrag.kind === "cover-open";
      const signedDistance = openingCover ? -deltaX : deltaX;
      const commitProgress = openingCover ? COVER_OPEN_COMMIT_PROGRESS : COVER_CLOSE_COMMIT_PROGRESS;
      pageDrag.direction = 0;
      pageDrag.progress = (horizontalDistance >= 3 && horizontalDistance >= Math.abs(deltaY) * 0.72)
        ? clamp(Math.max(0, signedDistance) / 140, 0, 1)
        : 0;
      pageDrag.peakProgress = Math.max(pageDrag.peakProgress, pageDrag.progress);
      if (pageDrag.peakProgress >= commitProgress) {
        pageDrag.committed = true;
      }
      updatePageDragMotion(event, deltaY);
      return;
    }

    if (horizontalDistance < 3 || horizontalDistance < Math.abs(deltaY) * 0.72) {
      pageDrag.progress = 0;
    } else {
      if (pageDrag.direction === 0 && horizontalDistance >= 6) {
        const direction = deltaX < 0 ? 1 : -1;
        const directionAvailable = direction > 0 ? currentSpread < SPREAD_COUNT - 1 : currentSpread > 0;
        pageDrag.direction = directionAvailable ? direction : 0;
      }

      const signedDistance = pageDrag.direction > 0 ? -deltaX : deltaX;
      pageDrag.progress = pageDrag.direction !== 0 ? clamp(Math.max(0, signedDistance) / 150, 0, 1) : 0;
      pageDrag.peakProgress = Math.max(pageDrag.peakProgress, pageDrag.progress);
      if (pageDrag.peakProgress >= PAGE_TURN_COMMIT_PROGRESS) {
        pageDrag.committed = true;
      }
    }
    updatePageDragMotion(event, deltaY);
  }

  function onPagePointerMove(event) {
    if (!pageDrag.active || event.pointerId !== pageDrag.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    updatePageDragFromEvent(event);
    requestFrame();
  }

  function onPagePointerEnd(event) {
    if (!pageDrag.active || event.pointerId !== pageDrag.pointerId) return;
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === "pointerup") updatePageDragFromEvent(event);
    const dragKind = pageDrag.kind;
    const releaseDistance = Math.hypot(event.clientX - pageDrag.startX, event.clientY - pageDrag.startY);
    const shouldClickOpen = event.type === "pointerup" && dragKind === "cover-open" && !pageDrag.committed && releaseDistance <= 12;
    if (pageDrag.committed) {
      settlePageDrag(true);
    } else if (shouldClickOpen) {
      resetPageDrag();
      detailPress.allowClick = false;
      setReadingOpen(true);
    } else {
      if (dragKind === "cover-open") {
        detailPress.allowClick = false;
      }
      cancelPageDrag();
    }
  }

  function onWindowPagePointerEnd(event) {
    if (!pageDrag.active || event.pointerId !== pageDrag.pointerId) return;
    if (event.type === "pointerup") updatePageDragFromEvent(event);
    settlePageDrag(true);
  }

  function setHovered(index) {
    if (hoveredIndex === index) return;
    hoveredIndex = index;
    canvas.classList.toggle("has-book-hover", index >= 0);
    requestFrame();
  }

  function onPointerMove(event) {
    setPointerFromEvent(event);
    requestFrame();
  }

  function onPointerLeave() {
    pointer.ndc.set(3, 3);
    pointerDirty = false;
    detailBookHovered = false;
    setHovered(-1);
    if (!pageDrag.active) {
      canvas.classList.remove("has-page-hover", "has-closed-book-hover");
    }
  }

  function onCanvasClick(event) {
    if (swipe.consumed) {
      swipe.consumed = false;
      return;
    }
    if (mode === "detail" && !readingOpen && event.button === 0) {
      if (!detailPress.allowClick) return;
      detailPress.allowClick = false;
      setPointerFromEvent(event);
      if (!activeBookAtPointer()) return;
      event.preventDefault();
      setReadingOpen(true);
      return;
    }
    if (mode !== "hero" || event.button !== 0) return;
    setPointerFromEvent(event);
    const clickedBookIndex = bookIndexAtPointer();
    if (clickedBookIndex < 0) return;
    event.preventDefault();
    selectMarker(clickedBookIndex, canvas);
    openDetail(canvas);
  }

  /*
   * Wheel / trackpad: when the section is lined up with the viewport, one gesture steps
   * one project. On the first project scrolling up, or the last scrolling down, the event
   * is left alone so the page keeps scrolling. Arriving from above or below snaps the
   * section into line once instead of skipping over it.
   */
  function onWheel(event) {
    if (event.ctrlKey || mode !== "hero" || disposed) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewHeight : 1;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = (horizontal ? event.deltaX : event.deltaY) * unit;
    const direction = Math.sign(delta);
    if (!direction) return;

    const now = event.timeStamp || performance.now();
    const absolute = Math.abs(delta);
    if (wheel.locked) {
      const quiet = now - wheel.lastTime > WHEEL_GESTURE_GAP_MS;
      const freshFlick = now - wheel.lockedAt > WHEEL_MIN_LOCK_MS && absolute > wheel.lastAbs * 1.8 && absolute > 10;
      if (quiet || freshFlick) wheel.locked = false;
    }
    wheel.lastTime = now;
    wheel.lastAbs = absolute;

    const top = section.getBoundingClientRect().top;
    const aligned = Math.abs(top) <= 2;

    if (!aligned) {
      if (horizontal) return;
      const crossingDown = direction > 0 && top > 0 && top - delta <= 0;
      const crossingUp = direction < 0 && top < 0 && top - delta >= 0;
      if (crossingDown || crossingUp) {
        event.preventDefault();
        window.scrollBy({ top, behavior: "instant" });
        wheel.locked = true;
        wheel.lockedAt = now;
        wheel.accumulated = 0;
      }
      return;
    }

    if (wheel.locked) {
      event.preventDefault();
      return;
    }

    const atStart = selectedIndex === 0 && direction < 0;
    const atEnd = selectedIndex === lastIndex && direction > 0;
    if ((atStart || atEnd) && !horizontal) {
      wheel.accumulated = 0;
      return;
    }

    event.preventDefault();
    wheel.accumulated += delta;
    if (Math.abs(wheel.accumulated) >= WHEEL_STEP_THRESHOLD) {
      navigate(Math.sign(wheel.accumulated), document.activeElement);
      wheel.accumulated = 0;
      wheel.locked = true;
      wheel.lockedAt = now;
    }
  }

  /* Touch: horizontal swipe steps; vertical swipes stay native page scroll (pan-y) */
  function onSwipeDown(event) {
    if (event.pointerType !== "touch" || mode !== "hero") return;
    swipe.active = true;
    swipe.pointerId = event.pointerId;
    swipe.startX = event.clientX;
    swipe.startY = event.clientY;
  }

  function onSwipeEnd(event) {
    if (!swipe.active || event.pointerId !== swipe.pointerId) return;
    swipe.active = false;
    if (event.type !== "pointerup") return;
    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;
    if (Math.abs(deltaX) >= SWIPE_MIN_PX && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      swipe.consumed = true;
      navigate(deltaX < 0 ? 1 : -1, canvas);
    }
  }

  function openDetail(origin = inspectButton) {
    if (mode !== "hero") return;
    mode = "opening";
    transitionTime = 0;
    readingOpen = false;
    detailBookHovered = false;
    currentSpread = 0;
    resetDetailPress();
    focusReturnTarget = origin === canvas
      ? markers.children[selectedIndex] || inspectButton
      : origin instanceof HTMLElement
        ? origin
        : inspectButton;
    activeBook = bookRigs[selectedIndex];
    ensureDetailTextures(activeBook);
    setInternalsVisible(activeBook, true);
    activeBook.root.visible = true;
    activeBook.contactShadow.visible = false;
    populateDetail(activeBook.data);
    updatePageControls(false);
    detailPanel.inert = false;
    detailPanel.setAttribute("aria-hidden", "false");
    browseUi.inert = true;
    root.classList.add("mode-detail", "is-opening");
    setHovered(-1);

    activeBook.root.updateWorldMatrix(true, true);
    activeBook.root.matrixWorld.decompose(openingBookPosition, openingBookQuaternion, openingBookScale);
    openingCameraPosition.copy(camera.position);
    openingCameraTarget.copy(transitionCameraTarget);
    openingShelfPosition.copy(shelfStage.position);
    openingMotionPosition.copy(activeBook.motion.position);
    openingMotionQuaternion.copy(activeBook.motion.quaternion);
    openingViewOffsetX = currentViewOffsetX;
    scene.add(activeBook.root);
    activeBook.root.position.copy(openingBookPosition);
    activeBook.root.quaternion.copy(openingBookQuaternion);
    activeBook.root.scale.copy(openingBookScale);
    applyDetailViewOffset();
    controls.enabled = false;
    liveRegion.textContent = `Opening ${activeBook.data.title}. Drag the cover, click the book, or use Open book to begin reading.`;

    if (reducedMotion) {
      finishOpening();
    }
    requestFrame();
  }

  function applyOpeningPose(progress) {
    const eased = smootherstep(clamp(progress, 0, 1));
    const shelfClearEased = smootherstep(clamp(progress / 0.68, 0, 1));
    inspectBookScale.setScalar(getInspectScale());
    shelfStage.position.lerpVectors(openingShelfPosition, inspectShelfPosition, shelfClearEased);
    activeBook.root.position.lerpVectors(openingBookPosition, inspectPosition, eased);
    activeBook.root.quaternion.slerpQuaternions(openingBookQuaternion, inspectBookQuaternion, eased);
    activeBook.root.scale.lerpVectors(openingBookScale, inspectBookScale, eased);
    activeBook.motion.position.lerpVectors(openingMotionPosition, restingMotionPosition, eased);
    activeBook.motion.quaternion.slerpQuaternions(openingMotionQuaternion, restingMotionQuaternion, eased);
    camera.position.lerpVectors(openingCameraPosition, inspectCameraPosition, eased);
    transitionCameraTarget.lerpVectors(openingCameraTarget, inspectCameraTarget, eased);
    currentViewOffsetX = lerp(openingViewOffsetX, detailViewOffsetX, eased);
    applyDetailViewOffset();
    camera.lookAt(transitionCameraTarget);
  }

  function finishOpening() {
    if (!activeBook) return;
    applyOpeningPose(1);
    mode = "detail";
    transitionTime = 1;
    controls.target.copy(inspectCameraTarget);
    controls.enabled = true;
    controls.enableDamping = !reducedMotion;
    controls.update();
    updatePageControls(false);
    root.classList.remove("is-opening");
    closeButton.focus({ preventScroll: true });
  }

  function closeDetail() {
    if (mode !== "detail") return;
    cancelPageDrag();
    resetDetailPress();
    mode = "closing";
    transitionTime = 0;
    readingOpen = false;
    detailBookHovered = false;
    currentSpread = 0;
    canvas.classList.remove("has-page-hover", "has-closed-book-hover");
    updatePageControls(false);
    controls.enabled = false;
    closingBookStartPosition.copy(activeBook.root.position);
    closingBookStartQuaternion.copy(activeBook.root.quaternion);
    closingBookStartScale.copy(activeBook.root.scale);
    closingMotionPosition.copy(activeBook.motion.position);
    closingMotionQuaternion.copy(activeBook.motion.quaternion);
    closingCameraPosition.copy(camera.position);
    closingCameraTarget.copy(controls.target);
    closingShelfPosition.copy(shelfStage.position);
    closingViewOffsetX = currentViewOffsetX;
    transitionCameraTarget.copy(closingCameraTarget);
    root.classList.remove("is-opening");
    alignShelfToSelection();
    closingBookPosition.set(
      shelfSlot(selectedIndex, selectedIndex).x,
      shelfBoardTop + activeBook.base.height * 0.5 + 0.15,
      0.37
    );
    bookRigs.forEach((rig, index) => {
      if (rig !== activeBook && rig.root.parent === shelfStage) {
        snapRigToShelfSlot(rig, index);
      }
    });
    root.classList.remove("mode-detail");
    detailPanel.setAttribute("aria-hidden", "true");
    detailPanel.inert = true;
    liveRegion.textContent = `Returning ${activeBook.data.title} to the shelf.`;
    if (reducedMotion) {
      finishClosing();
    }
    requestFrame();
  }

  function applyClosingPose(progress) {
    const eased = smootherstep(clamp(progress, 0, 1));
    const shelfReturnEased = smootherstep(clamp((progress - 0.24) / 0.76, 0, 1));
    shelfStage.position.lerpVectors(closingShelfPosition, shelfRestPosition, shelfReturnEased);
    activeBook.root.position.lerpVectors(closingBookStartPosition, closingBookPosition, eased);
    activeBook.root.quaternion.slerpQuaternions(closingBookStartQuaternion, closingBookQuaternion, eased);
    activeBook.root.scale.lerpVectors(closingBookStartScale, closingBookScale, eased);
    activeBook.motion.position.lerpVectors(closingMotionPosition, restingMotionPosition, eased);
    activeBook.motion.quaternion.slerpQuaternions(closingMotionQuaternion, restingMotionQuaternion, eased);
    camera.position.lerpVectors(closingCameraPosition, shelfCameraPosition, eased);
    transitionCameraTarget.lerpVectors(closingCameraTarget, shelfCameraTarget, eased);
    currentViewOffsetX = lerp(closingViewOffsetX, 0, eased);
    applyDetailViewOffset();
    camera.lookAt(transitionCameraTarget);
  }

  function finishClosing() {
    if (!activeBook) return;
    applyClosingPose(1);
    shelfStage.attach(activeBook.root);
    snapRigToShelfSlot(activeBook, selectedIndex);
    activeBook.contactShadow.visible = true;
    controls.target.copy(shelfCameraTarget);
    browseUi.inert = false;
    mode = "hero";
    transitionTime = 0;
    activeBook = null;
    liveRegion.textContent = `${BOOKS[selectedIndex].title} returned to the shelf.`;
    requestAnimationFrame(() => focusReturnTarget?.focus?.({ preventScroll: true }));
  }

  function resetInspectionView() {
    if (mode !== "detail") return;
    camera.position.copy(inspectCameraPosition);
    controls.target.copy(inspectCameraTarget);
    controls.update();
    liveRegion.textContent = `Inspection view reset for ${BOOKS[selectedIndex].title}.`;
    requestFrame();
  }

  function updateShelfLayout(delta) {
    if (mode === "hero") {
      position = reducedMotion ? targetPosition : damp(position, targetPosition, 9.5, delta);
      if (Math.abs(position - targetPosition) < 0.0005) position = targetPosition;
      else needsAnotherFrame = true;

      const nearest = clamp(Math.round(position), 0, lastIndex);
      if (nearest !== selectedIndex) updateSelection(nearest, false);
    }

    bookRigs.forEach((rig, index) => {
      if (rig.root.parent !== shelfStage) return;

      const slot = shelfSlot(index, position);
      const focus = slot.focus;
      const targetX = slot.x;
      const targetY = shelfBoardTop + rig.base.height * 0.5 + focus * 0.15;
      const targetZ = slot.z;
      const targetRotationY = slot.rotationY;
      const targetRotationZ = slot.rotationZ;
      const targetScale = 1 + focus * 0.09;
      const speed = reducedMotion ? 1000 : 12;

      rig.root.position.x = settle(rig.root.position.x, targetX, speed, delta);
      rig.root.position.y = settle(rig.root.position.y, targetY, speed, delta);
      rig.root.position.z = settle(rig.root.position.z, targetZ, speed, delta);
      rig.root.rotation.y = settle(rig.root.rotation.y, targetRotationY, speed, delta);
      rig.root.rotation.z = settle(rig.root.rotation.z, targetRotationZ, speed, delta);
      rig.root.scale.setScalar(settle(rig.root.scale.x, targetScale, speed, delta));

      const targetOpacity = slot.opacity;
      const nextOpacity = reducedMotion ? targetOpacity : settle(rig.opacity, targetOpacity, 18, delta, 0.002);
      if (nextOpacity !== rig.opacity) {
        rig.opacity = nextOpacity;
        rig.fadeMaterials.forEach((material) => {
          material.opacity = rig.opacity;
        });
        rig.contactShadow.material.opacity = rig.opacity * 0.24;
      }
      /* Books faded past the shelf's reach stop drawing altogether */
      rig.root.visible = rig.opacity > 0.01;
      rig.contactShadow.visible = true;

      const isHovered = hoveredIndex === index && mode === "hero";
      const hoverPreview = isHovered && !reducedMotion;
      const hoverAngle = hoverPreview ? -0.085 : 0;
      rig.frontPivot.rotation.y = settle(rig.frontPivot.rotation.y, hoverAngle, reducedMotion ? 1000 : 13, delta);
      /* The hover crack shows the endpaper, so internals draw only while the cover lifts */
      setInternalsVisible(rig, rig.frontPivot.rotation.y < -0.001);
      if (rig.internalsVisible) {
        rig.pagePivots.forEach((pagePivot) => {
          pagePivot.rotation.y = settle(pagePivot.rotation.y, 0, reducedMotion ? 1000 : 13, delta);
          pagePivot.rotation.z = settle(pagePivot.rotation.z, 0, reducedMotion ? 1000 : 13, delta);
          updateFlexiblePage(pagePivot, 0, delta);
        });
      }

      rig.motion.position.y = settle(rig.motion.position.y, hoverPreview ? 0.035 : 0, 9, delta);
      rig.motion.rotation.x = settle(rig.motion.rotation.x, hoverPreview ? pointer.ndc.y * 0.035 : 0, 10, delta);
      rig.motion.rotation.y = settle(rig.motion.rotation.y, hoverPreview ? -pointer.ndc.x * 0.035 : 0, 10, delta);
    });
  }

  function updateTransition(delta) {
    if (mode === "opening") {
      transitionTime = Math.min(1, transitionTime + delta / DETAIL_TRANSITION_DURATION);
      applyOpeningPose(transitionTime);
      updatePaginatedBook(activeBook, delta, 0);
      if (transitionTime >= 1) finishOpening();
    } else if (mode === "closing") {
      transitionTime = Math.min(1, transitionTime + delta / SHELF_TRANSITION_DURATION);
      applyClosingPose(transitionTime);
      updatePaginatedBook(activeBook, delta, 0);
      if (transitionTime >= 1) finishClosing();
    } else if (mode === "hero") {
      shelfStage.position.y = settle(shelfStage.position.y, 0, 10, delta);
      shelfStage.position.z = settle(shelfStage.position.z, 0, 10, delta);
      camera.position.x = settle(camera.position.x, shelfCameraPosition.x, 8, delta);
      camera.position.y = settle(camera.position.y, shelfCameraPosition.y, 8, delta);
      camera.position.z = settle(camera.position.z, shelfCameraPosition.z, 8, delta);
      transitionCameraTarget.copy(shelfCameraTarget);
      currentViewOffsetX = 0;
      applyDetailViewOffset();
      camera.lookAt(shelfCameraTarget);
    }
  }

  function requestFrame() {
    if (!rafId && !suspended && onScreen && renderer) {
      rafId = requestAnimationFrame(frame);
    }
  }

  function cancelFrame() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function getDetailOpenAmount() {
    if (pageDrag.active && pageDrag.kind === "cover-open") {
      return smoothstep(pageDrag.progress);
    }
    if (!readingOpen) return 0;
    if (pageDrag.active && pageDrag.kind === "cover-close") {
      return 1 - smoothstep(pageDrag.progress);
    }
    return 1;
  }

  /* Render on demand: a frame is scheduled only while something is still moving */
  function adaptResolution(frameMs) {
    if (pixelRatio <= 1) return;
    frameBudget.sampled += 1;
    frameBudget.totalMs += frameMs;
    if (frameBudget.sampled < 30) return;
    if (frameBudget.totalMs / frameBudget.sampled > 19) {
      pixelRatio = Math.max(1, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewWidth, viewHeight, false);
    }
    frameBudget.sampled = 0;
    frameBudget.totalMs = 0;
  }

  function frame(time) {
    rafId = 0;
    const frameMs = time - lastTime;
    const delta = Math.min(frameMs / 1000, 0.05);
    lastTime = time;
    /* Only consecutive animation frames say anything about GPU cost */
    if (frameMs < 250) adaptResolution(frameMs);
    needsAnotherFrame = false;

    if (pointerDirty) updateHover();
    updateShelfLayout(delta);
    updateTransition(delta);
    const themeIsMoving = updateTheme(delta);

    if (mode === "detail") {
      if (pageDrag.active) {
        pageDrag.progressVelocity = damp(pageDrag.progressVelocity, 0, 9, delta);
      }
      if (controls.update()) needsAnotherFrame = true;
      updatePaginatedBook(activeBook, delta, getDetailOpenAmount());
    }

    renderer.render(scene, camera);

    const shouldContinue = mode === "opening"
      || mode === "closing"
      || pageDrag.active
      || themeIsMoving
      || needsAnotherFrame;
    if (shouldContinue) requestFrame();
  }

  function resize() {
    if (!renderer) return;
    viewWidth = Math.max(1, root.clientWidth);
    viewHeight = Math.max(1, root.clientHeight);
    configureResponsiveTargets();
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(viewWidth, viewHeight, false);
    camera.aspect = viewWidth / viewHeight;
    camera.updateProjectionMatrix();
    const shelfDistance = Math.abs(shelfCameraPosition.z - 0.13);
    halfVisibleBooks = (shelfDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.aspect) / spacing;

    if (mode === "hero") {
      camera.position.copy(shelfCameraPosition);
      transitionCameraTarget.copy(shelfCameraTarget);
      currentViewOffsetX = 0;
      applyDetailViewOffset();
      camera.lookAt(shelfCameraTarget);
    } else if (mode === "detail" && activeBook) {
      activeBook.root.position.copy(inspectPosition);
      activeBook.root.scale.setScalar(getInspectScale());
      transitionCameraTarget.copy(inspectCameraTarget);
      currentViewOffsetX = detailViewOffsetX;
      applyDetailViewOffset();
      resetInspectionView();
    }
    requestFrame();
  }

  function sectionHasViewportFocus() {
    const rect = section.getBoundingClientRect();
    const middle = window.innerHeight * 0.5;
    return rect.top <= middle && rect.bottom >= middle;
  }

  function onKeyDown(event) {
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    const focusInside = root.contains(document.activeElement);
    if (!focusInside && !sectionHasViewportFocus()) return;

    if (event.key === "Escape" && mode === "detail") {
      event.preventDefault();
      closeDetail();
      return;
    }

    if (mode === "detail" && !event.metaKey && !event.ctrlKey && !event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      turnPage(event.key === "ArrowLeft" ? -1 : 1);
      return;
    }

    /* Keep keyboard focus inside the open book's controls, links included */
    if (mode === "detail" && event.key === "Tab" && focusInside) {
      const focusables = [...detailPanel.querySelectorAll("button, a[href]")].filter((element) => !element.disabled);
      const current = focusables.indexOf(document.activeElement);
      const next = event.shiftKey
        ? (current <= 0 ? focusables.length - 1 : current - 1)
        : (current >= focusables.length - 1 ? 0 : current + 1);
      event.preventDefault();
      focusables[next]?.focus();
      return;
    }

    if (mode !== "hero" || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowLeft") {
      if (navigate(-1, document.activeElement)) event.preventDefault();
    } else if (event.key === "ArrowRight") {
      if (navigate(1, document.activeElement)) event.preventDefault();
    }
  }

  function onVisibilityChange() {
    suspended = document.hidden;
    if (!suspended) {
      lastTime = performance.now();
      requestFrame();
    } else {
      settlePageDrag(true);
      resetDetailPress();
      cancelFrame();
    }
  }

  function onWindowBlur() {
    settlePageDrag(true);
    resetDetailPress();
  }

  function onReducedMotionChange(event) {
    cancelPageDrag();
    resetDetailPress();
    reducedMotion = event.matches;
    if (controls) controls.enableDamping = !reducedMotion;
    if (reducedMotion) {
      position = targetPosition;
    }
    requestFrame();
  }

  function showFallback(message) {
    loading.hidden = true;
    root.classList.remove("webgl-ready");
    if (fallbackStatus) fallbackStatus.textContent = message;
  }

  function handleContextLost(event) {
    event.preventDefault();
    cancelPageDrag();
    resetDetailPress();
    suspended = true;
    cancelFrame();
    showFallback("The 3D shelf paused after losing its graphics context. Reload to restore it.");
  }

  const onPreviousClick = () => navigate(-1, previousButton);
  const onNextClick = () => navigate(1, nextButton);
  const onInspectClick = () => openDetail(inspectButton);
  const onToggleBookClick = () => setReadingOpen(!readingOpen);
  const onPreviousPageClick = () => turnPage(-1);
  const onNextPageClick = () => turnPage(1);

  function dispose() {
    if (disposed) return;
    disposed = true;
    suspended = true;
    cancelPageDrag();
    resetDetailPress();
    cancelFrame();
    intersectionObserver?.disconnect();
    resizeObserver?.disconnect();

    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("click", onCanvasClick);
    canvas.removeEventListener("pointerdown", onDetailBookPointerDown, true);
    canvas.removeEventListener("pointermove", onDetailBookPointerMove, true);
    canvas.removeEventListener("pointerup", onDetailBookPointerEnd, true);
    canvas.removeEventListener("pointercancel", onDetailBookPointerEnd, true);
    canvas.removeEventListener("lostpointercapture", onDetailBookPointerEnd, true);
    canvas.removeEventListener("pointerdown", onPagePointerDown, true);
    canvas.removeEventListener("pointermove", onPagePointerMove, true);
    canvas.removeEventListener("pointerup", onPagePointerEnd, true);
    canvas.removeEventListener("pointercancel", onPagePointerEnd, true);
    canvas.removeEventListener("lostpointercapture", onPagePointerEnd, true);
    canvas.removeEventListener("pointerdown", onSwipeDown);
    canvas.removeEventListener("pointerup", onSwipeEnd);
    canvas.removeEventListener("pointercancel", onSwipeEnd);
    window.removeEventListener("pointerup", onWindowPagePointerEnd);
    window.removeEventListener("pointercancel", onWindowPagePointerEnd);
    window.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("blur", onWindowBlur);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
    previousButton.removeEventListener("click", onPreviousClick);
    nextButton.removeEventListener("click", onNextClick);
    inspectButton.removeEventListener("click", onInspectClick);
    closeButton.removeEventListener("click", closeDetail);
    toggleBookButton.removeEventListener("click", onToggleBookClick);
    previousPageButton.removeEventListener("click", onPreviousPageClick);
    nextPageButton.removeEventListener("click", onNextPageClick);
    resetButton.removeEventListener("click", resetInspectionView);
    markers.replaceChildren();

    controls?.dispose();
    const textures = new Set();
    scene?.traverse((object) => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) textures.add(value);
        });
        material.dispose();
      });
    });
    /* Rigs parked outside the scene graph (none normally) and shared resources */
    bookRigs.forEach((rig) => rig.fadeMaterials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value?.isTexture) textures.add(value);
      });
      material.dispose();
    }));
    Object.values(shared).forEach((resource) => resource?.dispose?.());
    textures.forEach((texture) => texture.dispose());
    environmentTarget?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss?.();
    renderer = null;
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  async function initialize() {
    const fontsReady = Promise.race([
      Promise.all([
        document.fonts.load(`500 64px ${TITLE_FONT}`),
        document.fonts.load(`600 16px ${LABEL_FONT}`),
        document.fonts.load(`400 18px ${LABEL_FONT}`),
      ]).catch(() => null),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    const [, wood, ...covers] = await Promise.all([
      fontsReady,
      loadImage(WOOD_TEXTURE_URL),
      ...BOOKS.map((book) => loadImage(book.image)),
    ]);
    if (disposed) return;
    woodImage = wood;
    covers.forEach((image, index) => {
      if (image) coverImages.set(BOOKS[index].id, image);
    });

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: tier.antialias
          && viewWidth * viewHeight * pixelRatio * pixelRatio <= MSAA_PIXEL_LIMIT,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch {
      showFallback("WebGL is unavailable in this browser, so the projects are listed below.");
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = tier.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(SHELF_THEME.roomWall, 0.027);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    environmentTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;
    scene.environmentIntensity = 0.72;
    pmremGenerator.dispose();

    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    shelfStage = new THREE.Group();
    shelfStage.name = "continuous-shelf-stage";
    scene.add(shelfStage);

    configureResponsiveTargets();
    camera.position.copy(shelfCameraPosition);
    camera.lookAt(shelfCameraTarget);

    controls = new OrbitControls(camera, canvas);
    controls.enabled = false;
    controls.enableDamping = !reducedMotion;
    controls.dampingFactor = 0.075;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 2.8;
    controls.maxDistance = 7.2;
    controls.minPolarAngle = Math.PI * 0.24;
    controls.maxPolarAngle = Math.PI * 0.76;
    controls.target.copy(shelfCameraTarget);
    controls.addEventListener("change", requestFrame);
    /* OrbitControls sets an inline touch-action: none; drop it so the stylesheet applies
       (pan-y on the shelf so phones can scroll past, none only while a book is open) */
    canvas.style.touchAction = "";

    addRoom();
    await addLights();
    if (disposed) return;
    addDust();
    buildMarkers();
    applyWoodTexture();
    resize();

    /* Paint one book per task so preloading never blocks page scrolling for long */
    const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));
    for (let index = 0; index < BOOKS.length; index += 1) {
      const rig = createBookRig(BOOKS[index], index);
      shelfStage.add(rig.root);
      snapRigToShelfSlot(rig, index);
      bookRigs.push(rig);
      /* Upload now rather than on first sight, so stepping to a new book never stalls */
      rig.fadeMaterials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) renderer.initTexture(value);
        });
      });
      await yieldToMain();
      if (disposed) return;
    }

    updateSelection(0, false, true);

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("pointerdown", onDetailBookPointerDown, { capture: true });
    canvas.addEventListener("pointermove", onDetailBookPointerMove, { capture: true });
    canvas.addEventListener("pointerup", onDetailBookPointerEnd, { capture: true });
    canvas.addEventListener("pointercancel", onDetailBookPointerEnd, { capture: true });
    canvas.addEventListener("lostpointercapture", onDetailBookPointerEnd, { capture: true });
    canvas.addEventListener("pointerdown", onPagePointerDown, { capture: true });
    canvas.addEventListener("pointermove", onPagePointerMove, { capture: true });
    canvas.addEventListener("pointerup", onPagePointerEnd, { capture: true });
    canvas.addEventListener("pointercancel", onPagePointerEnd, { capture: true });
    canvas.addEventListener("lostpointercapture", onPagePointerEnd, { capture: true });
    canvas.addEventListener("pointerdown", onSwipeDown);
    canvas.addEventListener("pointerup", onSwipeEnd);
    canvas.addEventListener("pointercancel", onSwipeEnd);
    window.addEventListener("pointerup", onWindowPagePointerEnd);
    window.addEventListener("pointercancel", onWindowPagePointerEnd);
    /* On window so the section-alignment snap also works when the wheel starts above it */
    window.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("webglcontextlost", handleContextLost);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    previousButton.addEventListener("click", onPreviousClick);
    nextButton.addEventListener("click", onNextClick);
    inspectButton.addEventListener("click", onInspectClick);
    closeButton.addEventListener("click", closeDetail);
    toggleBookButton.addEventListener("click", onToggleBookClick);
    previousPageButton.addEventListener("click", onPreviousPageClick);
    nextPageButton.addEventListener("click", onNextPageClick);
    resetButton.addEventListener("click", resetInspectionView);

    /* Draw only while the section is on screen and the tab is visible */
    suspended = document.hidden;
    intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) {
        lastTime = performance.now();
        requestFrame();
      } else {
        cancelFrame();
      }
    });
    intersectionObserver.observe(root);
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(root);

    /* Parallel shader compile where supported, instead of stalling the first frame */
    await renderer.compileAsync(scene, camera);
    if (disposed) return;
    renderer.render(scene, camera);
    loading.hidden = true;
    root.classList.add("webgl-ready");
    onReady?.();
    requestFrame();
  }

  initialize().catch((error) => {
    console.error("[project-shelf]", error);
    showFallback("The 3D shelf could not be prepared, so the projects are listed below.");
  });

  return dispose;
}
