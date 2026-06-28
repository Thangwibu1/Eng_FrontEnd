import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveVocabulary } from '../api/vocabularyApi';

export function useSaveVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveVocabulary,
    onSuccess: (_, vocabularyId) => {
      queryClient.invalidateQueries({ queryKey: ['me', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary', vocabularyId] });
      queryClient.invalidateQueries({ queryKey: ['reading'] });
    },
  });
}
