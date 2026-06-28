import { httpClient } from '../../../shared/api/httpClient';

export interface VocabularyQuery {
  search?: string;
  type?: string;
  level?: string;
  topicId?: string;
  page?: number;
  limit?: number;
}

export interface VocabularySearchQuery {
  q: string;
  type?: string;
  level?: string;
  topic?: string;
  limit?: number;
}

export interface VocabularySearchResult {
  query: string;
  normalizedQuery: string;
  results: Array<{
    id: string;
    text: string;
    type: string;
    level?: string;
    partOfSpeech?: string;
    phonetic?: string;
    meanings: Array<{ meaningVi: string; meaningEn?: string; examples: any[] }>;
    forms: Array<{ formText: string; normalizedFormText: string }>;
    matchType: 'exact' | 'prefix' | 'fuzzy';
    score: number;
  }>;
  suggestions: string[];
  meta: {
    exactCount: number;
    prefixCount: number;
    fuzzyCount: number;
  };
}

export async function getVocabularies(query: VocabularyQuery) {
  const res = await httpClient.get('/vocabularies', { params: query });
  return res.data.data;
}

export async function searchVocabularies(query: VocabularySearchQuery): Promise<VocabularySearchResult> {
  const res = await httpClient.get('/vocabularies/search', { params: query });
  return res.data.data;
}

export async function getVocabularyDetail(id: string) {
  const res = await httpClient.get(`/vocabularies/${id}`);
  return res.data.data;
}

export async function saveVocabulary(id: string) {
  const res = await httpClient.post(`/vocabularies/${id}/save`);
  return res.data.data;
}

export async function markVocabularyKnown(id: string) {
  const res = await httpClient.post(`/vocabularies/${id}/mark-known`);
  return res.data.data;
}

export async function markVocabularyDifficult(id: string) {
  const res = await httpClient.post(`/vocabularies/${id}/mark-difficult`);
  return res.data.data;
}

// Admin APIs
export async function createVocabulary(payload: any) {
  const res = await httpClient.post('/vocabularies', payload);
  return res.data.data;
}

export async function createVocabularyAdmin(payload: {
  text: string;
  type?: string;
  level?: string;
  partOfSpeech?: string;
  phonetic?: string;
  meanings?: any[];
  forms?: { formText: string; formType?: string }[];
  topicIds?: string[];
  status?: string;
  useAi?: boolean;
}) {
  const res = await httpClient.post('/vocabularies/add-vocab', payload);
  return res.data;
}

export async function updateVocabulary(id: string, payload: any) {
  const res = await httpClient.patch(`/vocabularies/${id}`, payload);
  return res.data.data;
}

export async function deleteVocabulary(id: string) {
  const res = await httpClient.delete(`/vocabularies/${id}`);
  return res.data.data;
}
