import { httpClient } from '../../../shared/api/httpClient';

export interface MeResponse {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'user' | 'contributor' | 'admin';
}

export interface AuthResponse {
  user: MeResponse;
  accessToken: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export async function register(input: RegisterInput) {
  const res = await httpClient.post('/auth/register', input);
  const data = res.data.data as AuthResponse;
  localStorage.setItem('accessToken', data.accessToken);
  return data.user;
}

export async function login(input: LoginInput) {
  const res = await httpClient.post('/auth/login', input);
  const data = res.data.data as AuthResponse;
  localStorage.setItem('accessToken', data.accessToken);
  return data.user;
}

export async function getMe() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }
  const res = await httpClient.get('/me');
  return res.data.data as MeResponse | null;
}

export async function logout() {
  localStorage.removeItem('accessToken');
}

export interface ForgotPasswordInput {
  identifier: string;
  newPassword: string;
  confirmPassword: string;
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const res = await httpClient.post('/auth/forgot-password', input);
  return res.data;
}
