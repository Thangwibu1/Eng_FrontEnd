import { httpClient } from '../../../shared/api/httpClient';

export async function getMyDecks() {
  const res = await httpClient.get('/flashcard-decks');
  return res.data.data;
}

export async function getDeckDetail(id: string) {
  const res = await httpClient.get(`/flashcard-decks/${id}`);
  return res.data.data;
}

export async function createDeck(input: {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
}) {
  const res = await httpClient.post('/flashcard-decks', input);
  return res.data.data;
}

export async function addCardToDeck(deckId: string, vocabularyId: string) {
  const res = await httpClient.post(`/flashcard-decks/${deckId}/cards`, {
    vocabularyId,
  });
  return res.data.data;
}

export async function reviewCard(input: {
  deckId: string;
  cardId: string;
  vocabularyId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
}) {
  const res = await httpClient.post(
    `/flashcard-decks/${input.deckId}/review`,
    input
  );
  return res.data.data;
}
