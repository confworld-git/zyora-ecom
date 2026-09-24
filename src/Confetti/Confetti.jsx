import { useMemo } from "react";
import "./Confetti.css";

const CONFETTI_COLORS = [
  "#ff6b6b", "#ffd93d", "#6bc5ff", "#4dd599",
  "#ff9ff3", "#a29bfe", "#ff8c42", "#00d2d3",
];
const EMOJIS = ["🎉", "🎊", "✨", "🎈"];

const generateConfetti = (side, seed) =>
  Array.from({ length: 90 }, (_, i) => {
    const baseAngle = side === "left" ? -55 : -125;
    const angle = baseAngle + (Math.random() * 55 - 27.5);
    const power = 200 + Math.random() * 320;
    const rad = (angle * Math.PI) / 180;
    const isEmoji = Math.random() > 0.9;
    const gravityBias = 0.6 + Math.random() * 0.8; // how "heavy" this piece falls
    return {
      id: `${side}-${seed}-${i}`,
      isEmoji,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      peakX: Math.cos(rad) * power,
      peakY: Math.sin(rad) * power,
      // wind/drift sway sampled at two points on the way down, not just one linear drift
      swayX1: (Math.random() * 70 - 35),
      swayX2: (Math.random() * 130 - 65),
      fallX: Math.cos(rad) * power * 0.25 + (Math.random() * 90 - 45),
      fallDistance: (380 + Math.random() * 320) * gravityBias,
      rotateMid: Math.random() * 300 - 150,
      rotateEnd: Math.random() * 1080 - 540,
      flipDur: 0.4 + Math.random() * 0.6, // independent flutter speed
      delay: Math.random() * 0.6,
      duration: (2.4 + Math.random() * 1.6) / gravityBias,
      size: isEmoji ? 16 + Math.random() * 10 : 5 + Math.random() * 8,
      shape: Math.random() > 0.6 ? "50%" : Math.random() > 0.5 ? "2px" : "0",
    };
  });

const generateStreamers = (side, seed) =>
  Array.from({ length: 12 }, (_, i) => {
    const baseAngle = side === "left" ? -55 : -125;
    const angle = baseAngle + (Math.random() * 55 - 27.5);
    const power = 240 + Math.random() * 300;
    const rad = (angle * Math.PI) / 180;
    return {
      id: `stream-${side}-${seed}-${i}`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      peakX: Math.cos(rad) * power,
      peakY: Math.sin(rad) * power,
      swayX: Math.random() * 100 - 50,
      fallDistance: 360 + Math.random() * 300,
      rotateEnd: Math.random() * 620 - 310,
      delay: Math.random() * 0.5,
      duration: 2.6 + Math.random() * 1.4,
    };
  });

/**
 * Fire-and-forget confetti burst.
 * @param {boolean} active - whether to render a burst right now
 * @param {number|string} burstKey - change this to trigger a *new* burst
 */
const Confetti = ({ active, burstKey = 0 }) => {
  const pieces = useMemo(() => {
    if (!active) return null;
    return {
      left: generateConfetti("left", burstKey),
      right: generateConfetti("right", burstKey),
      streamLeft: generateStreamers("left", burstKey),
      streamRight: generateStreamers("right", burstKey),
    };
  }, [active, burstKey]);

  if (!active || !pieces) return null;

  const renderConfetti = (arr) =>
    arr.map((p) => {
      const style = {
        "--peakX": `${p.peakX}px`,
        "--peakY": `${p.peakY}px`,
        "--swayX1": `${p.swayX1}px`,
        "--swayX2": `${p.swayX2}px`,
        "--fallX": `${p.fallX}px`,
        "--fallDist": `${p.fallDistance}px`,
        "--rotMid": `${p.rotateMid}deg`,
        "--rotEnd": `${p.rotateEnd}deg`,
        animationDelay: `${p.delay}s`,
        animationDuration: `${p.duration}s`,
      };
      const flutterStyle = {
        animationDuration: `${p.flipDur}s`,
        animationDelay: `${p.delay}s`,
      };
      return p.isEmoji ? (
        <span key={p.id} className="confetti-emoji" style={{ ...style, fontSize: `${p.size}px` }}>
          {p.emoji}
        </span>
      ) : (
        <span key={p.id} className="confetti-piece" style={style}>
          <span
            className="confetti-flutter"
            style={{
              ...flutterStyle,
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: p.shape,
            }}
          />
        </span>
      );
    });

  const renderStreamers = (arr) =>
    arr.map((s) => (
      <span
        key={s.id}
        className="confetti-streamer"
        style={{
          "--peakX": `${s.peakX}px`,
          "--peakY": `${s.peakY}px`,
          "--swayX": `${s.swayX}px`,
          "--fallDist": `${s.fallDistance}px`,
          "--rotEnd": `${s.rotateEnd}deg`,
          background: s.color,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.duration}s`,
        }}
      />
    ));

  return (
    <div className="confetti-stage">
      <div className="confetti-burst confetti-left">
        {renderConfetti(pieces.left)}
        {renderStreamers(pieces.streamLeft)}
      </div>
      <div className="confetti-burst confetti-right">
        {renderConfetti(pieces.right)}
        {renderStreamers(pieces.streamRight)}
      </div>
    </div>
  );
};

export default Confetti;