/* Mirrors SHELF_STARTUP_VISIBLE in shelf-engine.ts, which this file cannot import without
   pulling in Three.js; scripts/check-project-shelf.mjs keeps the two equal */
export const SHELF_STARTUP_VISIBLE = 3;

type PrefetchProject = { title: string; image?: string };

const WOOD_TEXTURE_URL = "/projects/shelf/walnut.webp";

/* Same slug rule as the engine's book ids, which name the cover files */
function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* Warms the browser image cache for what the shelf blocks on at startup, without
   pulling in Three.js. Returns the URLs it requested. */
export function prefetchShelfStartupImages(
  projects: readonly PrefetchProject[],
  load: (url: string) => void = (url) => {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  },
) {
  const urls = [WOOD_TEXTURE_URL];
  for (const project of projects.slice(0, SHELF_STARTUP_VISIBLE)) {
    urls.push(`/projects/shelf/covers/${slug(project.title)}.webp`);
    if (project.image) urls.push(project.image);
  }
  urls.forEach(load);
  return urls;
}
