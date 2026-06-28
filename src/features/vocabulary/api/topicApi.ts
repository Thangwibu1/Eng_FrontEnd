import { httpClient } from '../../../shared/api/httpClient';

export interface Topic {
  id: string;
  name: string;
  description?: string;
  parentTopicId?: string;
  createdAt?: string;
}

export async function getTopics(): Promise<Topic[]> {
  const res = await httpClient.get('/topics');
  return res.data.data;
}

export async function createTopic(input: {
  name: string;
  description?: string;
  parentTopicId?: string;
}): Promise<Topic> {
  const res = await httpClient.post('/topics', input);
  return res.data.data;
}

export async function deleteTopic(id: string): Promise<void> {
  await httpClient.delete(`/topics/${id}`);
}
