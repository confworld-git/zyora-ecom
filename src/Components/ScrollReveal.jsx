import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";

const DESKTOP_QUERY = "(min-width: 1024px)";

const subscribeToDesktopQuery = (callback) => {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

const getDesktopSnapshot = () =>
  typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;

const getServerDesktopSnapshot = () => false;

const ScrollReveal = ({
  as = "div",
  children,
  className,
  style,
  delay = 0,
  duration = 0.8,
  distance = 14,
  once = true,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isDesktop = useSyncExternalStore(
    subscribeToDesktopQuery,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
  const MotionElement = motion[as] || motion.div;
  const shouldAnimate = isDesktop && !shouldReduceMotion;
  const visibleState = {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  };
  const initialState = shouldAnimate
    ? {
        opacity: 0,
        y: distance + 8,
        scale: 0.975,
        filter: "blur(0px)",
      }
    : false;

  return (
    <MotionElement
      className={className}
      style={style}
      initial={initialState}
      animate={shouldAnimate ? undefined : visibleState}
      whileInView={shouldAnimate ? visibleState : undefined}
      viewport={{
        once,
        amount: 0.15,
        margin: "0px 0px -40px 0px",
      }}
      transition={{
        duration: shouldAnimate ? duration : 0,
        delay: shouldAnimate ? delay : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </MotionElement>
  );
};

export default ScrollReveal;
