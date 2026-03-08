import { apiClient } from '../client';
import type { Clinic, UpdateClinicBody } from '../types';

export const clinics = {
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
