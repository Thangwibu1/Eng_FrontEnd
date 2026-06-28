import { useQuery } from '@tanstack/react-query';
import { getTopics } from '../api/topicApi';

export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: getTopics,
  });
}
