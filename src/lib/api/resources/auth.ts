import { apiClient } from '../client';
import type { AuthResponse, AuthUser, GoogleVerifyBody } from '../types';

export const auth = {
  /** Verify a Google id_token and receive a JWT + user info. */
  googleVerify(body: GoogleVerifyBody) {
    return apiClient
      .post<AuthResponse>('/auth/google/verify', body)
      .then((r) => r.data);
  },

  /** Return the currently authenticated user (validates the stored JWT). */
  me() {
    return apiClient.get<AuthUser>('/auth/me').then((r) => r.data);
  },
};
