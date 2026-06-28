import { httpClient } from '../../../shared/api/httpClient';

export interface AiVocabularySuggestion {
  id: string;
  readingId: string;
  suggestedBy: 'ai';
  provider: '9router';
  model: string;
  text: string;
  normalizedText: string;
  type:
    | 'single_word'
    | 'compound_word'
    | 'collocation'
    | 'phrasal_verb'
    | 'idiom'
    | 'fixed_phrase'
    | 'sentence_pattern';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech?: string | null;
  meaningVi: string;
  meaningEn?: string | null;
  forms: string[];
  topics: string[];
  exampleEn?: string | null;
  exampleVi?: string | null;
  sourceText?: string | null;
  confidence: number;
  duplicateStatus: 'new' | 'exists_in_dictionary' | 'duplicate_in_suggestions' | 'possible_duplicate';
  duplicateVocabularyId?: string | null;
  status: 'pending' | 'edited' | 'approved' | 'rejected';
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function analyzeReadingWithAi(readingId: string, force = false): Promise<any> {
  const res = await httpClient.post(`/admin/readings/${readingId}/ai-analyze`, { force });
  return res.data.data;
}

export async function getReadingAiSuggestions(readingId: string, status?: string): Promise<AiVocabularySuggestion[]> {
  const params: any = {};
  if (status) params.status = status;
  const res = await httpClient.get(`/admin/readings/${readingId}/ai-suggestions`, { params });
  return res.data.data;
}

export async function updateAiSuggestion(suggestionId: string, patch: Partial<AiVocabularySuggestion>): Promise<AiVocabularySuggestion> {
  const res = await httpClient.patch(`/admin/ai-vocabulary-suggestions/${suggestionId}`, patch);
  return res.data.data;
}

export async function approveAiSuggestion(suggestionId: string): Promise<any> {
  const res = await httpClient.post(`/admin/ai-vocabulary-suggestions/${suggestionId}/approve`);
  return res.data.data;
}

export async function rejectAiSuggestion(suggestionId: string, adminNote?: string): Promise<AiVocabularySuggestion> {
  const res = await httpClient.post(`/admin/ai-vocabulary-suggestions/${suggestionId}/reject`, { adminNote });
  return res.data.data;
}

export async function reprocessReading(readingId: string): Promise<any> {
  const res = await httpClient.post(`/admin/readings/${readingId}/reprocess`);
  return res.data.data;
}
