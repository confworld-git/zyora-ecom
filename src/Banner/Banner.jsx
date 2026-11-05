import "./Banner.css";
import banner_img from "../assets/Banner/banner.gif";
import { useEffect, useState } from "react";

const Banner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const bannerStatus = localStorage.getItem("showBanner");

    if (bannerStatus !== "closed") {
      setShowBanner(true);
    }
  }, []);

  const closeBanner = () => {
    setShowBanner(false);
    localStorage.setItem("showBanner", "closed");
  };

  if (!showBanner) return null;

  return (
    <div className="main_banner">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-x preview-icon"
          onClick={closeBanner}
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>

        <img src={banner_img} alt="ZYORA promotional banner" />
      </div>
    </div>
  );
};

export default Banner;
