import { useEffect, useRef } from "react";

const ScrollVideo = ({ src, poster, className, style }) => {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let inView = false;
    let timer = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView) video.pause();
      },
      { threshold: 0.3 }
    );
    observer.observe(video);

    const onScroll = () => {
      if (!inView) return;
      if (video.paused) video.play().catch(() => {});
      clearTimeout(timer);
      timer = setTimeout(() => video.pause(), 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      style={style}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
};

export default ScrollVideo;