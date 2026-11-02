"use client";

import { useEffect, useRef } from "react";
import { MARK_BOT, MARK_TOP } from "./mark";

type Vec3 = [number, number, number];
type Face = { pts: Vec3[]; kind: "front" | "back" | "side" };

const BARS = [MARK_TOP, MARK_BOT].map((poly) =>
  poly.map(([x, y]) => [(x - 108.5) / 92, (93.5 - y) / 92 + 0.08] as [number, number]),
);

function extrude(poly: [number, number][], depth: number): Face[] {
  const ring = [...poly].reverse();
  const front: Vec3[] = ring.map(([x, y]) => [x, y, depth]);
  const back: Vec3[] = ring.map(([x, y]) => [x, y, -depth]);
  const faces: Face[] = [
    { pts: front, kind: "front" },
    { pts: [...back].reverse(), kind: "back" },
  ];
  for (let index = 0; index < ring.length; index += 1) {
    const next = (index + 1) % ring.length;
    faces.push({
      pts: [back[index], back[next], front[next], front[index]],
      kind: "side",
    });
  }
  return faces;
}

const FACES = [...extrude(BARS[0], 0.28), ...extrude(BARS[1], 0.28)];

const RAIL: Vec3[] = [
  [-1.7, 1.62, 0.2],
  [-0.5, 1.82, 0.55],
  [0.75, 1.68, 0.12],
  [1.75, 1.48, 0.42],
];

const LIGHT: Vec3 = norm([0.32, 0.84, 0.44]);

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function norm(a: Vec3): Vec3 {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
}

function rotate(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = p[0] * cy + p[2] * sy;
  const z1 = -p[0] * sy + p[2] * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
}

export function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const canvas: HTMLCanvasElement = node;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = media.matches;
    let frame = 0;
    let raf = 0;
    let alive = true;
    let visible = true;
    let cssW = 1;
    let cssH = 1;
    let dpr = 1;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(1, parent.clientWidth);
      cssH = Math.max(1, parent.clientHeight);
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
    }

    function project(p: Vec3, yaw: number, pitch: number) {
      const rotated = rotate(p, yaw, pitch);
      const depth = rotated[2] + 4.6;
      const scale = (Math.min(cssW, cssH) * 1.42) / depth;
      return {
        x: cssW * 0.5 + rotated[0] * scale,
        y: cssH * 0.64 - rotated[1] * scale,
        z: depth,
      };
    }

    function stroke(ax: number, ay: number, bx: number, by: number) {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    function draw() {
      if (!alive) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      const time = reduced ? 0.85 : frame / 60;
      const yaw = Math.sin(time * 0.42) * 0.55;
      const pitch = 0.36 + Math.sin(time * 0.28) * 0.035;

      const bloom = ctx.createRadialGradient(cssW * 0.52, cssH * 0.4, 0, cssW * 0.52, cssH * 0.42, Math.min(cssW, cssH) * 0.62);
      bloom.addColorStop(0, "rgba(255,255,255,0.7)");
      bloom.addColorStop(0.5, "rgba(255,255,255,0.12)");
      bloom.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, cssW, cssH);

      ctx.lineWidth = 1;
      for (let index = 0; index <= 8; index += 1) {
        const x = -2 + index * 0.5;
        const top = project([x, 1.7, -1.45], yaw, pitch);
        const bottom = project([x, -1.15, -1.45], yaw, pitch);
        ctx.strokeStyle = "rgba(74,120,176,0.18)";
        stroke(top.x, top.y, bottom.x, bottom.y);
      }
      for (let index = 0; index <= 6; index += 1) {
        const y = -1.15 + index * 0.475;
        const left = project([-2, y, -1.45], yaw, pitch);
        const right = project([2, y, -1.45], yaw, pitch);
        ctx.strokeStyle = "rgba(120,145,180,0.16)";
        stroke(left.x, left.y, right.x, right.y);
      }
      for (let index = 0; index <= 8; index += 1) {
        const x = -2 + index * 0.5;
        const far = project([x, -1.22, -1.3], yaw, pitch);
        const near = project([x, -1.22, 1.45], yaw, pitch);
        ctx.strokeStyle = `rgba(74,120,176,${0.05 + index * 0.012})`;
        stroke(far.x, far.y, near.x, near.y);
      }
      for (let index = 0; index <= 6; index += 1) {
        const z = -1.3 + index * 0.46;
        const left = project([-2, -1.22, z], yaw, pitch);
        const right = project([2, -1.22, z], yaw, pitch);
        ctx.strokeStyle = "rgba(120,145,180,0.14)";
        stroke(left.x, left.y, right.x, right.y);
      }

      const shadow = project([0, -0.95, 0], yaw, pitch);
      const shadowRadius = Math.min(cssW, cssH) * 0.3;
      const shade = ctx.createRadialGradient(shadow.x, shadow.y, 6, shadow.x, shadow.y, shadowRadius);
      shade.addColorStop(0, "rgba(15,32,64,0.16)");
      shade.addColorStop(1, "rgba(15,32,64,0)");
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.ellipse(shadow.x, shadow.y, shadowRadius, shadowRadius * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      const painted = FACES.map((face) => {
        const pts = face.pts.map((point) => rotate(point, yaw, pitch));
        const normal = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
        const depth = pts.reduce((sum, point) => sum + point[2], 0) / pts.length;
        return { face, pts, normal, depth };
      })
        .filter((face) => face.normal[2] > 0.015)
        .sort((a, b) => a.depth - b.depth);

      const unit = Math.min(cssW, cssH) * 1.42;
      for (const face of painted) {
        const light = Math.max(0, dot(face.normal, LIGHT));
        const screen = face.pts.map((point) => {
          const depth = point[2] + 4.6;
          const scale = unit / depth;
          return { x: cssW * 0.5 + point[0] * scale, y: cssH * 0.64 - point[1] * scale };
        });
        ctx.beginPath();
        ctx.moveTo(screen[0].x, screen[0].y);
        for (const point of screen.slice(1)) ctx.lineTo(point.x, point.y);
        ctx.closePath();
        if (face.face.kind === "front") {
          const ink = Math.round(6 + light * 22);
          ctx.fillStyle = `rgb(${ink}, ${14 + Math.round(light * 16)}, ${34 + Math.round(light * 22)})`;
        } else if (face.face.kind === "back") {
          ctx.fillStyle = "rgb(8,16,32)";
        } else {
          const tone = 0.4 + light * 0.6;
          ctx.fillStyle = `rgb(${Math.round(30 + tone * 36)}, ${Math.round(52 + tone * 48)}, ${Math.round(88 + tone * 64)})`;
        }
        ctx.fill();
      }

      const nodes = RAIL.map((point, index) =>
        project([point[0], point[1] + Math.sin(time * 0.65 + index) * 0.035, point[2]], yaw, pitch),
      );
      ctx.lineCap = "butt";
      for (let index = 0; index < nodes.length - 1; index += 1) {
        const from = nodes[index];
        const to = nodes[index + 1];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx, dy) || 1;
        const nx = -dy / length;
        const ny = dx / length;
        const width = Math.max(5, Math.min(cssW, cssH) * 0.018);
        ctx.strokeStyle = "rgba(200,215,234,0.8)";
        ctx.lineWidth = width;
        stroke(from.x, from.y, to.x, to.y);
        ctx.strokeStyle = "rgba(86,114,156,0.38)";
        ctx.lineWidth = 1;
        stroke(from.x + nx * width * 0.4, from.y + ny * width * 0.4, to.x + nx * width * 0.4, to.y + ny * width * 0.4);
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = Math.max(1, width * 0.2);
        stroke(from.x - nx * width * 0.2, from.y - ny * width * 0.2, to.x - nx * width * 0.2, to.y - ny * width * 0.2);
      }

      const radii = [0.045, 0.062, 0.04, 0.054];
      nodes.forEach((node, index) => {
        const radius = Math.max(10, Math.min(cssW, cssH) * radii[index]);
        const orb = ctx.createRadialGradient(node.x - radius * 0.32, node.y - radius * 0.36, radius * 0.08, node.x, node.y, radius);
        orb.addColorStop(0, "rgba(255,255,255,0.98)");
        orb.addColorStop(0.42, "rgba(214,231,252,0.75)");
        orb.addColorStop(0.8, "rgba(98,148,214,0.5)");
        orb.addColorStop(1, "rgba(47,95,158,0.66)");
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = Math.max(1, radius * 0.07);
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(1, radius - ctx.lineWidth), 0, Math.PI * 2);
        ctx.stroke();
      });

      if (!reduced) {
        const travel = (time * 0.32) % (nodes.length - 1);
        const index = Math.floor(travel);
        const mix = travel - index;
        const from = nodes[index];
        const to = nodes[index + 1];
        const x = from.x + (to.x - from.x) * mix;
        const y = from.y + (to.y - from.y) * mix;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 18);
        glow.addColorStop(0, "rgba(255,255,255,0.95)");
        glow.addColorStop(0.28, "rgba(186,214,244,0.8)");
        glow.addColorStop(1, "rgba(74,120,176,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      frame += 1;
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
    }

    function kick() {
      cancelAnimationFrame(raf);
      if (alive) draw();
    }

    resize();
    kick();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) kick();
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !reduced) kick();
    });
    intersection.observe(canvas);
    const onMotion = () => {
      reduced = media.matches;
      kick();
    };
    media.addEventListener("change", onMotion);
    const onHide = () => {
      if (!document.hidden && !reduced) kick();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      media.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
