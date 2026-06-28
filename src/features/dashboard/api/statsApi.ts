import { httpClient } from '../../../shared/api/httpClient';

export interface DashboardStats {
  vocabularyLearned: number;
  vocabularyWeeklyIncrement: number;
  readingStreak: number;
  bestStreak: number;
  flashcardReviewsToday: number;
  flashcardReviewsTotal: number;
  levels: {
    beginner: number;
    elementary: number;
    intermediate: number;
    advanced: number;
  };
  recentWords: {
    text: string;
    type: string;
  }[];
}

export async function getMyStats() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  const res = await httpClient.get('/me/stats');
  return res.data.data as DashboardStats;
}
