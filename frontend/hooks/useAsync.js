// hooks/useAsync.js  (add reset → clears previous error)
import { useState, useCallback } from "react";

export default function useAsync(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        return await asyncFn(...args);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  const reset = () => setError(null);

  return { run, loading, error, reset };
}
