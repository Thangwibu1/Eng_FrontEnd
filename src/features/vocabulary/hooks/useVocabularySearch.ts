import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchVocabularies } from '../api/vocabularyApi';
import type { VocabularySearchQuery, VocabularySearchResult } from '../api/vocabularyApi';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debounced;
}

export function useVocabularySearch(params: VocabularySearchQuery) {
  const debouncedQ = useDebounce(params.q, 300);

  return useQuery<VocabularySearchResult>({
    queryKey: ['vocabularies', 'search', { ...params, q: debouncedQ }],
    queryFn: () => searchVocabularies({ ...params, q: debouncedQ }),
    enabled: debouncedQ.trim().length >= 2,
    staleTime: 30_000,
  });
}
