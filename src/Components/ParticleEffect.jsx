import { useEffect, useRef } from "react";

const ParticleEffect = ({ className, color = "#ffffff" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let particles;

    const initialize = async () => {
      const { default: CanvasParticles } = await import("canvasparticles-js");
      const container = containerRef.current;
      if (cancelled || !container) return;

      const canvas = document.createElement("canvas");
      container.appendChild(canvas);

      particles = new CanvasParticles(canvas, {
        mouse: {
          interactionType: 2,
          connectDistMult: 0.8,
          distRatio: 0.8,
        },
        particles: {
          color,
          ppm: 120,
          connectDistance: 140,
        },
      });

      particles.setParticleColor?.(color);
      particles.start();
    };

    initialize().catch((error) => {
      console.error("Failed to initialize particle effect:", error);
    });

    return () => {
      cancelled = true;
      particles?.destroy();
    };
  }, [color]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
};

export default ParticleEffect;
