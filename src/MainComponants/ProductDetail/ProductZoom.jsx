import { useState } from "react";
import "./ProductZoom.css";

export default function ProductZoom({ image }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setPosition({ x, y });
  };

  return (
    <div className="product-zoom-wrapper">
      {/* Main image */}
      <div
        className="product-image"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <img src={image} alt="Product" draggable={false} />

        {zooming && (
          <div
            className="zoom-lens"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
          />
        )}
      </div>

      {/* Zoom panel */}
      {zooming && (
        <div className="zoom-panel">
          <img
            src={image}
            alt=""
            style={{
              left: `${50 - position.x * 2}%`,
              top: `${50 - position.y * 2}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
