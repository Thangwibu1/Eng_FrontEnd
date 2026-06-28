import { useQuery } from '@tanstack/react-query';
import { getVocabularies } from '../api/vocabularyApi';
import type { VocabularyQuery } from '../api/vocabularyApi';

export function useVocabularies(query: VocabularyQuery) {
  return useQuery({
    queryKey: ['vocabularies', query],
    queryFn: () => getVocabularies(query),
  });
}
