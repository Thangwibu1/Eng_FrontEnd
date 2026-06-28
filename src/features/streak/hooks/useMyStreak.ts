import { useQuery } from '@tanstack/react-query';
import { getMyStreak } from '../api/streakApi';

export function useMyStreak() {
  return useQuery({
    queryKey: ['me', 'streak'],
    queryFn: getMyStreak,
    enabled: Boolean(localStorage.getItem('accessToken')),
  });
}
