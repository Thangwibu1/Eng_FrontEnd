import { useQuery } from '@tanstack/react-query';
import { getReadings } from '../api/readingApi';

export function useReadings(query: any) {
  return useQuery({
    queryKey: ['readings', query],
    queryFn: () => getReadings(query),
  });
}
