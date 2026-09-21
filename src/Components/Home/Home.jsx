import { useMemo } from "react";
import "./Home.css";
import softtoys from "../../assets/Logo/soft_toys.png";
import { HiShoppingBag } from "react-icons/hi2";

const CONFETTI_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bc5ff",
  "#4dd599",
  "#ff9ff3",
  "#a29bfe",
  "#ff8c42",
  "#00d2d3",
];
const EMOJIS = ["🎉", "🎊", "✨", "🎈"];

const generateConfetti = (side, seed) =>
  Array.from({ length: 45 }, (_, i) => {
    const baseAngle = side === "left" ? -55 : -125;
    const angle = baseAngle + (Math.random() * 50 - 25);
    const power = 220 + Math.random() * 280;
    const rad = (angle * Math.PI) / 180;
    const isEmoji = Math.random() > 0.87;

    return {
      id: `${side}-${seed}-${i}`,
      isEmoji,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      peakX: Math.cos(rad) * power,
      peakY: Math.sin(rad) * power,
      fallX: Math.cos(rad) * power * 0.3 + (Math.random() * 60 - 30),
      fallDistance: 400 + Math.random() * 300,
      rotateMid: Math.random() * 360 - 180,
      rotateEnd: Math.random() * 900 - 450,
      wobble: 12 + Math.random() * 18,
      delay: Math.random() * 0.5,
      duration: 2.2 + Math.random() * 1.4,
      size: isEmoji ? 16 + Math.random() * 10 : 5 + Math.random() * 7,
      shape: Math.random() > 0.5 ? "50%" : Math.random() > 0.5 ? "2px" : "0",
    };
  });

const generateStreamers = (side, seed) =>
  Array.from({ length: 7 }, (_, i) => {
    const baseAngle = side === "left" ? -55 : -125;
    const angle = baseAngle + (Math.random() * 50 - 25);
    const power = 260 + Math.random() * 260;
    const rad = (angle * Math.PI) / 180;
    return {
      id: `stream-${side}-${seed}-${i}`,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      peakX: Math.cos(rad) * power,
      peakY: Math.sin(rad) * power,
      fallDistance: 380 + Math.random() * 260,
      rotateEnd: Math.random() * 500 - 250,
      delay: Math.random() * 0.4,
      duration: 2.4 + Math.random() * 1.2,
    };
  });

const Home = () => {
  const pieces = useMemo(() => {
    return {
      left: generateConfetti("left"),
      right: generateConfetti("right"),
      streamLeft: generateStreamers("left"),
      streamRight: generateStreamers("right"),
    };
  }, []);

  const renderConfetti = (arr) =>
    arr.map((p) => {
      const style = {
        "--peakX": `${p.peakX}px`,
        "--peakY": `${p.peakY}px`,
        "--fallX": `${p.fallX}px`,
        "--fallDist": `${p.fallDistance}px`,
        "--rotMid": `${p.rotateMid}deg`,
        "--rotEnd": `${p.rotateEnd}deg`,
        "--wobble": `${p.wobble}px`,
        animationDelay: `${p.delay}s`,
        animationDuration: `${p.duration}s`,
      };
      return p.isEmoji ? (
        <span
          key={p.id}
          className="confetti-emoji"
          style={{ ...style, fontSize: `${p.size}px` }}
        >
          {p.emoji}
        </span>
      ) : (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            ...style,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: p.shape,
          }}
        />
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
          "--fallDist": `${s.fallDistance}px`,
          "--rotEnd": `${s.rotateEnd}deg`,
          background: s.color,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.duration}s`,
        }}
      />
    ));

  return (
    <div className="home-container">
      <div className="confetti-burst confetti-left">
        {renderConfetti(pieces.left)}
        {renderStreamers(pieces.streamLeft)}
      </div>
      <div className="confetti-burst confetti-right">
        {renderConfetti(pieces.right)}
        {renderStreamers(pieces.streamRight)}
      </div>

      <div className="image-wrapper">
        <img src={softtoys} alt="Soft Toys" className="soft-toys-image" />
      </div>
      <h1>
        Welcome to <span>ZYORA</span> <br /> Where Everyday Meets Extraordinary
      </h1>
      <span>Destination for E-commerce</span>
      <p>
        From cuddly soft toys to smart home essentials, handy stationery to
        stylish handbags <br /> discover products that make everyday life a
        little more delightful.
      </p>
      <button>
        Shop Now <HiShoppingBag />
      </button>
    </div>
  );
};

export default Home;
