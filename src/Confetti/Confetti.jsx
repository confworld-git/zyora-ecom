import { useMemo } from "react";
import "./Confetti.css";

const CONFETTI_COLORS = [
  "#ff6b6b", "#ffd93d", "#6bc5ff", "#4dd599",
  "#ff9ff3", "#a29bfe", "#ff8c42", "#00d2d3",
];
const EMOJIS = ["🎉", "🎊", "✨", "🎈", "💫", "🌟", "⚡️"];

const createRandom = (seed) => {
  let state = 2166136261;
  for (const character of String(seed)) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  }

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const generateConfetti = (side, seed) =>
  Array.from({ length: 90 }, (_, i) => {
    const random = createRandom(`${side}-${seed}-${i}`);
    const baseAngle = side === "left" ? -55 : -125;
    const angle = baseAngle + (random() * 55 - 27.5);
    const power = 200 + random() * 320;
    const rad = (angle * Math.PI) / 180;
    const isEmoji = random() > 0.9;
    const gravityBias = 0.6 + random() * 0.8;
    return {
      id: `${side}-${seed}-${i}`,
      isEmoji,
      emoji: EMOJIS[Math.floor(random() * EMOJIS.length)],
      color: CONFETTI_COLORS[Math.floor(random() * CONFETTI_COLORS.length)],
      peakX: Math.cos(rad) * power,
      peakY: Math.sin(rad) * power,
      // wind/drift sway sampled at two points on the way down, not just one linear drift
      swayX1: random() * 70 - 35,
      swayX2: random() * 130 - 65,
      fallX: Math.cos(rad) * power * 0.25 + (random() * 90 - 45),
      fallDistance: (380 + random() * 320) * gravityBias,
      rotateMid: random() * 300 - 150,
      rotateEnd: random() * 1080 - 540,
      flipDur: 0.4 + random() * 0.6,
      delay: random() * 0.6,
      duration: (2.4 + random() * 1.6) / gravityBias,
      size: isEmoji ? 16 + random() * 10 : 5 + random() * 8,
      shape: random() > 0.6 ? "50%" : random() > 0.5 ? "2px" : "0",
    };
  });

const generateStreamers = (side, seed) =>
  Array.from({ length: 12 }, (_, i) => {
    const random = createRandom(`stream-${side}-${seed}-${i}`);
    const baseAngle = side === "left" ? -55 : -125;
    const angle = baseAngle + (random() * 55 - 27.5);
    const power = 240 + random() * 300;
    const rad = (angle * Math.PI) / 180;
    return {
      id: `stream-${side}-${seed}-${i}`,
      color: CONFETTI_COLORS[Math.floor(random() * CONFETTI_COLORS.length)],
      peakX: Math.cos(rad) * power,
      peakY: Math.sin(rad) * power,
      swayX: random() * 100 - 50,
      fallDistance: 360 + random() * 300,
      rotateEnd: random() * 620 - 310,
      delay: random() * 0.5,
      duration: 2.6 + random() * 1.4,
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