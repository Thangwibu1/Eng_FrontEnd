import { httpClient } from '../../../shared/api/httpClient';

export interface StreakWeekDay {
  date: string;
  label: string;
  active: boolean;
}

export interface MyStreakResponse {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  week: StreakWeekDay[];
}

export async function getMyStreak() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  const res = await httpClient.get('/me/streak');
  return res.data.data as MyStreakResponse;
}
