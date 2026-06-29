import { useMutation } from '@tanstack/react-query';
import { lookupVocabulary } from '../api/contributionReadingApi';

export function useLookupVocabulary() {
  return useMutation({
    mutationFn: lookupVocabulary,
  });
}
