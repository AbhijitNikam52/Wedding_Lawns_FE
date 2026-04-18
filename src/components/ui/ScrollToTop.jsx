import { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 bg-primary text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-all hover:scale-110 active:scale-95"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTop;