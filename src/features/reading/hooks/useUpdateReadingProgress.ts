import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReadingProgress } from '../api/readingApi';

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReadingProgress,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['me', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['reading', variables.readingId] });
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}
