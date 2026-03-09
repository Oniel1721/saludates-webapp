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
  get(clinicId: string) {
    return apiClient
      .get<Clinic>(`/clinics/${clinicId}`)
      .then((r) => r.data);
  },

  /** Update clinic name or address. */
  update(clinicId: string, body: UpdateClinicBody) {
    return apiClient
      .patch<Clinic>(`/clinics/${clinicId}`, body)
      .then((r) => r.data);
  },
};
