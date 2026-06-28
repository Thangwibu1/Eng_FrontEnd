import { httpClient } from '../../../shared/api/httpClient';

export interface VocabularyQuery {
  search?: string;
  type?: string;
  level?: string;
  topicId?: string;
  page?: number;
  limit?: number;
}

export async function getVocabularies(query: VocabularyQuery) {
  const res = await httpClient.get('/vocabularies', { params: query });
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

export async function updateVocabulary(id: string, payload: any) {
  const res = await httpClient.patch(`/vocabularies/${id}`, payload);
  return res.data.data;
}

export async function deleteVocabulary(id: string) {
  const res = await httpClient.delete(`/vocabularies/${id}`);
  return res.data.data;
}
