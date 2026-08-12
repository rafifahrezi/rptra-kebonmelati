import { useState, useCallback } from 'react';

export const useVectorSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, limit = 3) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/vector-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      setResults(data.results);
      return data.results;
    } catch (err: any) {
      setError(err.message || 'Vector search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, results, loading, error };
};
