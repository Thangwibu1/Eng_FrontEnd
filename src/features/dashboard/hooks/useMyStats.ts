import { useQuery } from '@tanstack/react-query';
import { getMyStats } from '../api/statsApi';

export function useMyStats() {
  const token = localStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['me', 'stats'],
    queryFn: getMyStats,
    enabled: Boolean(token),
  });
}
