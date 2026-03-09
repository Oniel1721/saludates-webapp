import axios from 'axios';

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ─── Token store ──────────────────────────────────────────────────────────────
// Simple in-memory store initialized from localStorage on the client.
// Server components will never call the API client directly.

const TOKEN_KEY = 'saludates_token';
const CLINIC_ID_KEY = 'saludates_clinic_id';

export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=2592000; SameSite=Lax`;
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  },
};

export const clinicIdStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(^| )${CLINIC_ID_KEY}=([^;]+)`));
    return match ? match[2] : null;
  },
  set(clinicId: string) {
    if (typeof window === 'undefined') return;
    document.cookie = `${CLINIC_ID_KEY}=${clinicId}; path=/; max-age=2592000; SameSite=Lax`;
  },
  clear() {
    if (typeof window === 'undefined') return;
    document.cookie = `${CLINIC_ID_KEY}=; path=/; max-age=0`;
  },
};

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
