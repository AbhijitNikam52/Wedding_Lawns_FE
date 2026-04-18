import { useState, useEffect, useCallback } from "react";

/**
 * Generic fetch hook.
 * @param {Function} fetchFn — async function that returns data
 * @param {Array}    deps    — dependency array (re-fetches when changed)
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(
 *     () => fetchLawns({ city }),
 *     [city]
 *   );
 */
const useFetch = (fetchFn, deps = []) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
};

export default useFetch;