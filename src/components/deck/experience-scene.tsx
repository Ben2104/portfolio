"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { activeAt, GAP, REST } from "./experience-math";

type Props = {
  roles: { n: string; when: string }[];
  /** 0..1 scroll progress through the section; the scene eases toward it. */
  progress: { current: number };
  onFail: () => void;
};

const W = 9;
const H = 5.2;
const ORANGE = new THREE.Color("#ff914d");
const INK = new THREE.Color("#e0e0e4");
const DIM = new THREE.Color("#5d5f6b");

/** The role number and dates, drawn white so the material colour can tint it. */
function labelTexture(n: string, when: string, display: string, mono: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = Math.round((1024 * H) / W);
  const g = c.getContext("2d");
  if (g) {
    g.fillStyle = "#fff";
    g.textBaseline = "alphabetic";
    g.font = "400 330px " + display;
    g.fillText(n, 52, c.height - 52);
    g.font = "400 30px " + mono;
    g.textAlign = "right";
    g.fillText(when.toUpperCase(), c.width - 60, 84);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function ExperienceScene({ roles, progress, onFail }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let cleanup = () => {};

    const boot = async () => {
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        onFail();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      // the canvas draws with the page fonts, so wait for them
      try {
        await document.fonts.ready;
      } catch {}
      if (cancelled) {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      const cs = getComputedStyle(document.documentElement);
      const display = cs.getPropertyValue("--font-anton").trim() || "Impact, sans-serif";
      const mono = cs.getPropertyValue("--font-jbm").trim() || "monospace";

      const n = roles.length;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 400);

      // the route: one control point per role, plus a run-up before and after
      const pts = Array.from({ length: n + 2 }, (_, k) =>
        new THREE.Vector3(Math.sin(k * 0.95) * 3.2, Math.cos(k * 0.7) * 1.2, GAP - k * GAP),
      );
      const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
      const step = 1 / (n + 1);
      const routeLength = curve.getLength();

      // one frame per role, standing across the route
      type Frame = {
        group: THREE.Group;
        main: THREE.MeshBasicMaterial;
        echo: THREE.MeshBasicMaterial;
        glass: THREE.MeshBasicMaterial;
        label: THREE.MeshBasicMaterial;
        node: THREE.Mesh;
        nodeMat: THREE.MeshBasicMaterial;
        k: number;
      };
      const barX = new THREE.BoxGeometry(W, 0.06, 0.14);
      const barY = new THREE.BoxGeometry(0.06, H, 0.14);
      const glassGeo = new THREE.PlaneGeometry(W, H);
      const nodeGeo = new THREE.OctahedronGeometry(0.42);
      const frames: Frame[] = roles.map((r, i) => {
        const group = new THREE.Group();
        const mk = (o: number) => new THREE.MeshBasicMaterial({ color: DIM, transparent: true, opacity: o, depthWrite: false });
        const main = mk(0.9);
        const echo = mk(0.3);
        const glass = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.015, depthWrite: false, side: THREE.DoubleSide });
        const label = new THREE.MeshBasicMaterial({
          map: labelTexture(r.n, r.when, display, mono),
          color: INK,
          transparent: true,
          depthWrite: false,
        });
        const nodeMat = new THREE.MeshBasicMaterial({ color: DIM, wireframe: true, transparent: true, depthWrite: false });
        const bars = (mat: THREE.Material, s: number, z: number) => {
          for (const [geo, x, y] of [
            [barX, 0, H / 2],
            [barX, 0, -H / 2],
            [barY, -W / 2, 0],
            [barY, W / 2, 0],
          ] as const) {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x * s, y * s, z);
            m.scale.set(s, s, 1);
            group.add(m);
          }
        };
        bars(main, 1, 0);
        bars(echo, 0.955, -0.7);
        bars(echo, 0.91, -1.4);
        group.add(new THREE.Mesh(glassGeo, glass));
        const text = new THREE.Mesh(glassGeo, label);
        text.position.z = 0.03;
        group.add(text);
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(W / 2 - 0.95, -H / 2 + 0.95, 0.5);
        group.add(node);

        const p = curve.getPointAt((i + 1) * step);
        const tan = curve.getTangentAt((i + 1) * step);
        group.position.copy(p);
        group.lookAt(p.clone().sub(tan)); // +Z (the face) toward the approaching camera
        scene.add(group);
        return { group, main, echo, glass, label, node, nodeMat, k: 0 };
      });

      // the timeline axis under the frames, lit up to where you are
      const railPts = curve.getPoints(300).map((v) => v.clone().add(new THREE.Vector3(0, -3.3, 0)));
      const railDim = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(railPts),
        new THREE.LineBasicMaterial({ color: DIM, transparent: true, opacity: 0.5 }),
      );
      const railLit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(railPts), new THREE.LineBasicMaterial({ color: ORANGE }));
      scene.add(railDim, railLit);

      // dust along the route, for depth
      const COUNT = 650;
      const dust = new Float32Array(COUNT * 3);
      const tmp = new THREE.Vector3();
      for (let i = 0; i < COUNT; i++) {
        curve.getPointAt(Math.random(), tmp);
        const a = Math.random() * Math.PI * 2;
        const r = 4.5 + Math.random() * 11;
        dust[i * 3] = tmp.x + Math.cos(a) * r;
        dust[i * 3 + 1] = tmp.y + Math.sin(a) * r * 0.7;
        dust[i * 3 + 2] = tmp.z + (Math.random() - 0.5) * GAP;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
      const dustMat = new THREE.PointsMaterial({ size: 0.075, color: INK, transparent: true, opacity: 0.5, depthWrite: false });
      const points = new THREE.Points(dustGeo, dustMat);
      scene.add(points);

      // size and framing: on a wide screen the tunnel sits right of the text card
      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        const aspect = w / h;
        camera.aspect = aspect;
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(27)) * Math.max(1, 1.55 / aspect)));
        if (w > 860) camera.setViewOffset(w, h, -w * 0.13, -h * 0.05, w, h);
        else camera.setViewOffset(w, h, 0, h * 0.12, w, h);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const camPos = new THREE.Vector3();
      const look = new THREE.Vector3();
      let s = progress.current;
      let last = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) {
          last = now;
          return;
        }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const ease = 1 - Math.exp(-dt * 5);
        s += (progress.current - s) * ease;
        pointer.x += (pointer.tx - pointer.x) * ease;
        pointer.y += (pointer.ty - pointer.y) * ease;
        const t = now / 1000;

        // camera rides the route, a little behind the frame it is heading for
        const cu = THREE.MathUtils.clamp(step + (n - 1) * step * s - REST / routeLength, 0, 1);
        curve.getPointAt(cu, camPos);
        curve.getPointAt(Math.min(1, cu + 0.05), look);
        camera.position.set(camPos.x + pointer.x * 0.45, camPos.y + 0.25 - pointer.y * 0.3, camPos.z);
        camera.lookAt(look);
        camera.rotateZ(Math.sin(s * (n - 1) * Math.PI * 2) * 0.035); // banks between frames, level at rest

        const active = activeAt(progress.current, n);
        frames.forEach((f, i) => {
          f.k += ((i === active ? 1 : 0) - f.k) * ease * 1.4;
          const dist = f.group.position.distanceTo(camera.position);
          const fade = THREE.MathUtils.clamp(1 - (dist - 8) / 52, 0, 1);
          f.main.color.copy(DIM).lerp(ORANGE, f.k);
          f.main.opacity = (0.55 + 0.45 * f.k) * fade;
          f.echo.color.copy(DIM).lerp(ORANGE, f.k * 0.7);
          f.echo.opacity = (0.22 + 0.2 * f.k) * fade;
          f.glass.opacity = (0.012 + 0.03 * f.k) * fade;
          f.label.color.copy(DIM).lerp(INK, 0.55 + 0.45 * f.k).lerp(ORANGE, f.k * 0.35);
          f.label.opacity = (0.35 + 0.65 * f.k) * fade;
          f.nodeMat.color.copy(DIM).lerp(ORANGE, f.k);
          f.nodeMat.opacity = (0.5 + 0.5 * f.k) * fade;
          f.node.rotation.set(t * 0.5 + i, t * 0.8, 0);
          f.node.scale.setScalar(1 + 0.35 * f.k + Math.sin(t * 2 + i) * 0.05 * f.k);
        });
        railLit.geometry.setDrawRange(0, Math.max(2, Math.round(cu * 300)));
        points.position.y = Math.sin(t * 0.3) * 0.25;
        renderer.render(scene, camera);
        if (el.dataset.ready !== "1") el.dataset.ready = "1";
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("pointermove", onMove);
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          m.geometry?.dispose?.();
          const mat = m.material as THREE.Material | THREE.Material[] | undefined;
          for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) {
            (x as THREE.MeshBasicMaterial).map?.dispose();
            x.dispose();
          }
        });
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    };

    boot();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [roles, progress, onFail]);

  return <div ref={host} className="exp__gl" aria-hidden="true" />;
}
