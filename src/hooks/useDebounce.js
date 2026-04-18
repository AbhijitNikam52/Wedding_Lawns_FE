import { useState, useEffect } from "react";

/**
 * Delays updating a value until the user stops typing.
 * @param {any}    value — the input value to debounce
 * @param {number} delay — milliseconds to wait (default 400ms)
 */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;