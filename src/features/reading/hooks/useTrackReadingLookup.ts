import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackReadingLookup } from '../api/readingApi';

export function useTrackReadingLookup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trackReadingLookup,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['me', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['reading', variables.readingId] });
    },
  });
}
