import { useEffect, useRef } from "react";
import CanvasParticles from "canvasparticles-js";

const ParticleEffect = ({ className, color = "#ffffff" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    const particles = new CanvasParticles(canvas, {
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

    return () => particles.destroy();
  }, [color]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
};

export default ParticleEffect;
