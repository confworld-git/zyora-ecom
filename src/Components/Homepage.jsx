import { useEffect, useState } from "react";
import "../index.css";
import Intro from "./Intro/Intro";
import Navbar from "./Navbar/Navbar";
import Home from "./Home/Home";
import Welcome from "./Welcome/Welcome";
import Highlights from "./Highlights/Highlights";

const Homepage = () => {
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem("introShown") !== "true";
  });

  useEffect(() => {
    if (!showIntro) return;

    const timer = setTimeout(() => {
      localStorage.setItem("introShown", "true");

      setShowIntro(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showIntro]);

  return (
    <div>
      {showIntro && <Intro />}
      <Navbar />
      <Home />
      <Welcome />
      <Highlights />
    </div>
  );
};

export default Homepage;
