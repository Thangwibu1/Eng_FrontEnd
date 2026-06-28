import { useMutation } from '@tanstack/react-query';
import { analyzeContributionReadingWithAi } from '../api/contributionReadingApi';

export function useAnalyzeContributionReadingAi() {
  return useMutation({
    mutationFn: analyzeContributionReadingWithAi,
  });
}
