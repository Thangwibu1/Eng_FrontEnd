import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReadingAiSuggestions,
  analyzeReadingWithAi,
  updateAiSuggestion,
  approveAiSuggestion,
  rejectAiSuggestion,
  reprocessReading,
} from '../api/adminReadingAiApi';
import type { AiVocabularySuggestion } from '../api/adminReadingAiApi';

export function useReadingAiSuggestions(readingId: string, status?: string) {
  return useQuery({
    queryKey: ['admin-reading-suggestions', readingId, status],
    queryFn: () => getReadingAiSuggestions(readingId, status),
    enabled: Boolean(readingId),
  });
}

export function useAnalyzeReadingWithAi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ readingId, force }: { readingId: string; force?: boolean }) =>
      analyzeReadingWithAi(readingId, force),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reading-suggestions', variables.readingId] });
      queryClient.invalidateQueries({ queryKey: ['reading', variables.readingId] });
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}

export function useUpdateAiSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      suggestionId,
      patch,
    }: {
      suggestionId: string;
      readingId: string; // pass to invalidate
      patch: Partial<AiVocabularySuggestion>;
    }) => updateAiSuggestion(suggestionId, patch),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reading-suggestions', variables.readingId] });
    },
  });
}

export function useApproveAiSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      suggestionId,
    }: {
      suggestionId: string;
      readingId: string; // pass to invalidate
    }) => approveAiSuggestion(suggestionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reading-suggestions', variables.readingId] });
      queryClient.invalidateQueries({ queryKey: ['reading', variables.readingId] });
      queryClient.invalidateQueries({ queryKey: ['readings'] });
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] });
    },
  });
}

export function useRejectAiSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      suggestionId,
      adminNote,
    }: {
      suggestionId: string;
      readingId: string; // pass to invalidate
      adminNote?: string;
    }) => rejectAiSuggestion(suggestionId, adminNote),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reading-suggestions', variables.readingId] });
    },
  });
}

export function useReprocessReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (readingId: string) => reprocessReading(readingId),
    onSuccess: (_, readingId) => {
      queryClient.invalidateQueries({ queryKey: ['reading', readingId] });
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}
