import { useState, useEffect, useRef } from "react";

/**
 * Fires when a DOM element enters the viewport.
 * Used for lazy loading images and infinite scroll triggers.
 *
 * Usage:
 *   const { ref, isIntersecting } = useIntersection({ threshold: 0.1 });
 *   <div ref={ref}>{isIntersecting && <HeavyComponent />}</div>
 */
const useIntersection = (options = {}) => {
  const ref                         = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
};

export default useIntersection;