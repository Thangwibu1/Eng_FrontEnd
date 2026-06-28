import { httpClient } from '../../../shared/api/httpClient';

export async function getReadings(query: any) {
  const res = await httpClient.get('/readings', { params: query });
  return res.data.data;
}

export async function getReadingDetail(id: string) {
  const res = await httpClient.get(`/readings/${id}`);
  return res.data.data;
}

export async function trackReadingLookup(input: {
  readingId: string;
  vocabularyId: string;
  readingSpanId?: string;
  lookupText?: string;
}) {
  const res = await httpClient.post(
    `/readings/${input.readingId}/lookups`,
    input
  );
  return res.data.data;
}

export async function updateReadingProgress(input: {
  readingId: string;
  progressPercent: number;
  lastPositionIndex: number;
}) {
  const res = await httpClient.post(
    `/readings/${input.readingId}/progress`,
    input
  );
  return res.data.data;
}

// Admin APIs
export async function createReading(payload: any) {
  const res = await httpClient.post('/readings', payload);
  return res.data.data;
}

export async function updateReading(id: string, payload: any) {
  const res = await httpClient.patch(`/readings/${id}`, payload);
  return res.data.data;
}

export async function deleteReading(id: string) {
  const res = await httpClient.delete(`/readings/${id}`);
  return res.data.data;
}

export async function reprocessReading(id: string) {
  const res = await httpClient.post(`/readings/${id}/reprocess`);
  return res.data.data;
}
