"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import * as THREE from "three";

import { profile } from "@/data/portfolio";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [isHovering, setIsHovering] = useState(false);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], [0, 220]);
  const textY = useTransform(scrollY, [0, 900], [0, 110]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrame = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const count = 220;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 34;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 12;
      velocities[index * 3] = (Math.random() - 0.5) * 0.018;
      velocities[index * 3 + 1] = (Math.random() - 0.5) * 0.012;
      velocities[index * 3 + 2] = 0;
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.07,
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });

    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointsMesh);

    const maxDistance = 5.5;
    const linePositions: number[] = [];

    for (let start = 0; start < count; start += 1) {
      for (let end = start + 1; end < count; end += 1) {
        const dx = positions[start * 3] - positions[end * 3];
        const dy = positions[start * 3 + 1] - positions[end * 3 + 1];
        const dz = positions[start * 3 + 2] - positions[end * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < maxDistance) {
          linePositions.push(
            positions[start * 3],
            positions[start * 3 + 1],
            positions[start * 3 + 2],
            positions[end * 3],
            positions[end * 3 + 1],
            positions[end * 3 + 2],
          );
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(linePositions), 3),
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.06,
    });
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    const geometries = [
      { geometry: new THREE.IcosahedronGeometry(2.2, 1), color: 0x00d4ff, position: [-9, 2.5, -4], opacity: 0.1 },
      { geometry: new THREE.OctahedronGeometry(1.8, 0), color: 0x7c3aed, position: [9, -2, -5], opacity: 0.12 },
      { geometry: new THREE.IcosahedronGeometry(1.2, 0), color: 0x00d4ff, position: [4, 5.5, -2], opacity: 0.09 },
      { geometry: new THREE.OctahedronGeometry(0.9, 0), color: 0x7c3aed, position: [-5, -5, -2], opacity: 0.11 },
      { geometry: new THREE.IcosahedronGeometry(0.7, 0), color: 0x00d4ff, position: [7, 4, -3], opacity: 0.08 },
    ] as const;

    const meshes = geometries.map(({ geometry, color, position, opacity: meshOpacity }) => {
      const material = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: meshOpacity,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      scene.add(mesh);

      return {
        mesh,
        rotationSpeed: [
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.004,
        ] as const,
      };
    });

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let time = 0;

    const handleMouseMove = (event: globalThis.MouseEvent) => {
      targetX = (event.clientX / width - 0.5) * 0.6;
      targetY = (event.clientY / height - 0.5) * 0.4;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      time += 0.004;

      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      pointsMesh.rotation.x = currentY * 0.25;
      pointsMesh.rotation.y = currentX * 0.25 + time * 0.04;
      linesMesh.rotation.x = pointsMesh.rotation.x;
      linesMesh.rotation.y = pointsMesh.rotation.y;

      const currentPositions = pointsGeometry.attributes.position
        .array as Float32Array;

      for (let index = 0; index < count; index += 1) {
        currentPositions[index * 3] += velocities[index * 3];
        currentPositions[index * 3 + 1] += velocities[index * 3 + 1];

        if (Math.abs(currentPositions[index * 3]) > 17) {
          velocities[index * 3] *= -1;
        }

        if (Math.abs(currentPositions[index * 3 + 1]) > 11) {
          velocities[index * 3 + 1] *= -1;
        }
      }

      pointsGeometry.attributes.position.needsUpdate = true;

      meshes.forEach(({ mesh, rotationSpeed }) => {
        mesh.rotation.x += rotationSpeed[0];
        mesh.rotation.y += rotationSpeed[1];
        mesh.rotation.z += rotationSpeed[2];
        mesh.position.y += Math.sin(time + mesh.position.x) * 0.003;
      });

      renderer.render(scene, camera);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      meshes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      });
    };
  }, []);

  const handleTextMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!textRef.current) {
      return;
    }

    const bounds = textRef.current.getBoundingClientRect();
    setMousePos({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  }, []);

  const scrollToNext = () => {
    const element = document.querySelector("#about");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-[var(--portfolio-bg)]"
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: "10%",
            left: "-10%",
            background:
              "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            right: "-5%",
            bottom: "5%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute left-1/2 top-[40%] rounded-full"
          style={{
            width: 300,
            height: 300,
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(4,4,15,0.85) 85%, #04040f 100%)",
        }}
      />

      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/8 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-cyan-400">
            {profile.availability}
          </span>
        </motion.div>

        <motion.div
          ref={textRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative cursor-default select-none"
          onMouseMove={handleTextMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setMousePos({ x: -999, y: -999 });
          }}
        >
          <h1 className="m-0 text-[clamp(56px,10vw,140px)] font-black leading-[0.92] tracking-[-0.04em] text-slate-50">
            {profile.name}
          </h1>
          <h1
            aria-hidden
            className="pointer-events-none absolute inset-0 m-0 text-[clamp(56px,10vw,140px)] font-black leading-[0.92] tracking-[-0.04em]"
            style={{
              background:
                "linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              clipPath: isHovering
                ? `circle(130px at ${mousePos.x}px ${mousePos.y}px)`
                : "circle(0px at 50% 50%)",
              transition: "clip-path 0.15s ease",
            }}
          >
            {profile.name}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-[560px] text-[clamp(16px,2.2vw,22px)] font-normal tracking-[-0.01em] text-slate-50/50"
        >
          Crafting digital experiences at the intersection of
          <span className="text-slate-50/80"> design </span>
          and
          <span className="text-slate-50/80"> engineering</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {profile.roles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-white/8 px-3 py-1 text-[12px] font-medium uppercase tracking-[0.08em] text-slate-50/45"
            >
              {role}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,212,255,0.35)" }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() =>
              document
                .querySelector("#projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full px-8 py-3.5 text-sm font-semibold tracking-[0.01em] text-white"
            style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
          >
            View my work
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() =>
              document
                .querySelector("#contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full border border-white/14 px-8 py-[13px] text-sm font-semibold tracking-[0.01em] text-slate-50/75"
          >
            Get in touch
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        type="button"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        onClick={scrollToNext}
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-50/30">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8, ease: "easeInOut" }}
        >
          <ArrowDown size={14} className="text-slate-50/30" />
        </motion.div>
      </motion.button>
    </section>
  );
}
