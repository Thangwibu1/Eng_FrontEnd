import { useQuery } from '@tanstack/react-query';
import { getVocabularyDetail } from '../api/vocabularyApi';

export function useVocabularyDetail(id: string) {
  return useQuery({
    queryKey: ['vocabulary', id],
    queryFn: () => getVocabularyDetail(id),
    enabled: Boolean(id),
  });
}
