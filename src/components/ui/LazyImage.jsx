import { useState, useRef, useEffect } from "react";

/**
 * Lazy-loads an image only when it enters the viewport.
 * Shows a shimmer placeholder until loaded, then fades in.
 *
 * Props:
 *   src        — image URL
 *   alt        — alt text
 *   className  — CSS classes for the img element
 *   fallback   — emoji/text shown when no src or load error
 *   aspectRatio — tailwind aspect ratio class (default "aspect-video")
 */
const LazyImage = ({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  fallback = "🏡",
  wrapperClass = "w-full h-full",
}) => {
  const [loaded,  setLoaded]  = useState(false);
  const [error,   setError]   = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // Only start loading when image enters viewport
  useEffect(() => {
    if (!src) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "200px" } // start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  if (!src || error) {
    return (
      <div ref={ref} className={`${wrapperClass} flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100`}>
        <span className="text-4xl">{fallback}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={`${wrapperClass} relative overflow-hidden`}>
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 animate-shimmer" />
      )}

      {/* Actual image — only renders src when visible */}
      {visible && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;