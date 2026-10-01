import { useEffect, useRef } from "react";

const hexToRgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Pre-rendered soft glow dot (much cheaper than shadowBlur on every frame)
function makeGlowSprite(hex) {
  const s = 64,
    c = s / 2;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const x = cv.getContext("2d");
  const [r, g, b] = hexToRgb(hex);
  const gr = x.createRadialGradient(c, c, 0, c, c, c);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.12, `rgba(${r},${g},${b},0.95)`);
  gr.addColorStop(0.35, `rgba(${r},${g},${b},0.22)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, s, s);
  return cv;
}

// Pre-rendered 4-point diamond glint with a soft halo
function makeStarSprite(hex) {
  const s = 96,
    c = s / 2;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const x = cv.getContext("2d");
  const [r, g, b] = hexToRgb(hex);

  const halo = x.createRadialGradient(c, c, 0, c, c, c);
  halo.addColorStop(0, "rgba(255,255,255,0.9)");
  halo.addColorStop(0.08, `rgba(${r},${g},${b},0.5)`);
  halo.addColorStop(0.3, `rgba(${r},${g},${b},0.12)`);
  halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = halo;
  x.fillRect(0, 0, s, s);

  x.beginPath();
  x.moveTo(c, 2);
  x.quadraticCurveTo(c, c, s - 2, c);
  x.quadraticCurveTo(c, c, c, s - 2);
  x.quadraticCurveTo(c, c, 2, c);
  x.quadraticCurveTo(c, c, c, 2);
  x.closePath();
  const body = x.createRadialGradient(c, c, 0, c, c, c);
  body.addColorStop(0, "rgba(255,255,255,1)");
  body.addColorStop(0.5, `rgba(${r},${g},${b},0.85)`);
  body.addColorStop(1, `rgba(${r},${g},${b},0.1)`);
  x.fillStyle = body;
  x.fill();
  return cv;
}

export default function ParticleBackground({
  particles = 1000,
  sparkleRatio = 0.09, // share of particles that are diamond glints
  // champagne gold, warm gold, ivory, rose gold, silver
  colors = ["#ffc125", "#df9827", "#f7d597", "#f2b8a2", "#dfe6f2"],
  // format: "rgba(r,g,b," (alpha and closing bracket are added in code)
  // gold, ruby/rose, deep sapphire
  blobColors = ["rgba(200,150,60,", "rgba(170,70,100,", "rgba(40,60,130,"],
  background = "#0e027e",
  pullRadius = 220,
  pullStrength = 0.045,
  trailRate = 1,
  blur = 0, // px of backdrop-filter blur over the effect (0 = off)
  style,
  className,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const rand = (a, b) => a + Math.random() * (b - a);

    let W = 0,
      H = 0,
      raf = 0;
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const glows = colors.map(makeGlowSprite);
    const stars = colors.map(makeStarSprite);

    const makeParticle = (o = {}) => {
      const star = o.star ?? Math.random() < sparkleRatio;
      const ci = (Math.random() * colors.length) | 0;
      return {
        x: o.x ?? rand(0, W),
        y: o.y ?? rand(0, H),
        vx: o.vx ?? rand(-0.12, 0.12),
        vy: o.vy ?? rand(-0.12, 0.12),
        star,
        r: star
          ? rand(5, 11)
          : Math.random() < 0.06
            ? rand(2.2, 3.4)
            : rand(0.5, 1.6),
        sprite: star ? stars[ci] : glows[ci],
        tw: rand(0, Math.PI * 2),
        ts: rand(0.015, 0.045),
        life: o.life ?? null,
      };
    };

    const ambient = Array.from({ length: particles }, () => makeParticle());
    const trail = [];

    const spawnSparkle = (x, y, vx, vy) => {
      const star = Math.random() < 0.35;
      const p = makeParticle({ x, y, vx, vy, star, life: 1 });
      p.r = star ? rand(4, 7) : rand(0.8, 2);
      trail.push(p);
      if (trail.length > 220) trail.splice(0, trail.length - 220);
    };

    const blobs = blobColors.map((c) => ({
      c,
      r: Math.max(W, H) * rand(0.35, 0.55),
      a: Math.random() * Math.PI * 2,
      s: rand(0.0004, 0.0008) * 16,
      ox: 0,
      oy: 0,
    }));

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.active) {
        mouse.sx = e.clientX;
        mouse.sy = e.clientY;
      }
      mouse.active = true;
      if (!reduce) {
        for (let i = 0; i < trailRate; i++) {
          spawnSparkle(
            mouse.x + rand(-6, 6),
            mouse.y + rand(-6, 6),
            rand(-0.5, 0.5),
            rand(-0.4, 0.2),
          );
        }
      }
    };
    const onDown = (e) => {
      if (reduce) return;
      for (let i = 0; i < 14; i++) {
        const a = rand(0, Math.PI * 2),
          sp = rand(0.8, 2.6);
        spawnSparkle(e.clientX, e.clientY, Math.cos(a) * sp, Math.sin(a) * sp);
      }
    };
    const onLeave = () => (mouse.active = false);

    const draw = (p, alpha, scale = 1) => {
      const size = (p.star ? p.r * 2.4 : p.r * 7) * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size);
    };

    const frame = () => {
      if (mouse.active) {
        mouse.sx += (mouse.x - mouse.sx) * 0.08;
        mouse.sy += (mouse.y - mouse.sy) * 0.08;
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, W, H);

      // Aurora blobs
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        if (!reduce) b.a += b.s;
        const bx = W / 2 + Math.cos(b.a) * W * 0.35;
        const by = H / 2 + Math.sin(b.a * 1.3) * H * 0.35;
        const tx = mouse.active ? (mouse.sx - W / 2) * 0.12 : 0;
        const ty = mouse.active ? (mouse.sy - H / 2) * 0.12 : 0;
        b.ox += (tx - b.ox) * 0.03;
        b.oy += (ty - b.oy) * 0.03;
        const x = bx + b.ox,
          y = by + b.oy;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, b.c + "0.5)");
        g.addColorStop(1, b.c + "0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Warm light that follows the cursor
      if (mouse.active) {
        const g = ctx.createRadialGradient(
          mouse.sx,
          mouse.sy,
          0,
          mouse.sx,
          mouse.sy,
          260,
        );
        g.addColorStop(0, "rgba(255,214,140,0.16)");
        g.addColorStop(0.5, "rgba(230,140,160,0.07)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = "source-over";

      // Gold dust + gem glints
      for (const p of ambient) {
        if (!reduce) {
          if (mouse.active) {
            const dx = mouse.sx - p.x,
              dy = mouse.sy - p.y;
            const d = Math.hypot(dx, dy);
            if (d < pullRadius && d > 1) {
              const f = (1 - d / pullRadius) * pullStrength;
              p.vx += (dx / d) * f + (-dy / d) * f * 0.6; // pull + slight swirl
              p.vy += (dy / d) * f + (dx / d) * f * 0.6;
            }
          }
          p.vx = p.vx * 0.98 + rand(-0.01, 0.01);
          p.vy = p.vy * 0.98 + rand(-0.01, 0.01);
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = W + 20;
          else if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20;
          else if (p.y > H + 20) p.y = -20;
        }
        p.tw += p.ts;
        if (p.star) {
          // mostly dark, then a sharp flash, like light catching a facet
          const f = Math.pow(Math.max(0, Math.sin(p.tw)), 5);
          if (f > 0.01) draw(p, f, 0.4 + 0.6 * f);
        } else {
          draw(p, 0.3 + 0.6 * (0.5 + 0.5 * Math.sin(p.tw)));
        }
      }

      // Cursor sparkles: drift, fall slightly, shrink and fade
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + 0.012;
        p.life -= 0.018;
        if (p.life <= 0) {
          trail.splice(i, 1);
          continue;
        }
        draw(p, p.life, p.star ? 0.5 + 0.5 * p.life : 1);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Listen on window so it works even though the canvas ignores pointer events
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseleave", onLeave);
    };
    // Re-init only if the visual config changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particles,
    sparkleRatio,
    pullRadius,
    pullStrength,
    trailRate,
    background,
    colors.join(),
    blobColors.join(),
  ]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        pointerEvents: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      {blur > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitBackdropFilter: `blur(${blur}px)`,
            backdropFilter: `blur(${blur}px)`,
          }}
        />
      )}
    </div>
  );
}
