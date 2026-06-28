import { useQuery } from '@tanstack/react-query';
import { getReadingDetail } from '../api/readingApi';

export function useReadingDetail(id: string) {
  return useQuery({
    queryKey: ['reading', id],
    queryFn: () => getReadingDetail(id),
    enabled: Boolean(id),
  });
}
