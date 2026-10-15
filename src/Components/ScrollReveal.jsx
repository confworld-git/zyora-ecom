import { motion, useReducedMotion } from "motion/react";

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
  const MotionElement = motion[as] || motion.div;

  return (
    <MotionElement
      className={className}
      style={style}
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: distance + 8,
              scale: 0.975,
              filter: "blur(0px)",
            }
      }
      whileInView={
        shouldReduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }
      }
      viewport={{
        once,
        amount: 0.15,
        margin: "0px 0px -40px 0px",
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </MotionElement>
  );
};

export default ScrollReveal;
