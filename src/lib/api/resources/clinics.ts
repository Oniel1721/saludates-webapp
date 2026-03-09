import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { apiClient } from '../client';
import type { Clinic, CreateClinicBody, UpdateClinicBody } from '../types';

export const clinics = {
  /** [Superadmin] List all clinics. */
  list() {
    return apiClient.get<Clinic[]>('/clinics').then((r) => r.data);
  },

  /** [Superadmin] Create a new clinic. */
  create(body: CreateClinicBody) {
    return apiClient.post<Clinic>('/clinics', body).then((r) => r.data);
  },

  /** Get a clinic by id. */
  get(clinicId: string, options?: { server?: { cookies: ReadonlyRequestCookies} }) {
    return apiClient
      .get<Clinic>(`/clinics/${clinicId}`,  {
        headers: options?.server?.cookies ? {
          Authorization: `Bearer ${options.server.cookies.get('saludates_token')?.value ?? ''}`,
        } : undefined,
      })
      .then((r) => r.data);
  },

  /** Update clinic name or address. */
  update(clinicId: string, body: UpdateClinicBody) {
    return apiClient
      .patch<Clinic>(`/clinics/${clinicId}`, body)
      .then((r) => r.data);
  },
};
