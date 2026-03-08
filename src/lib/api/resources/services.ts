import { apiClient } from '../client';
import type { CreateServiceBody, Service, UpdateServiceBody } from '../types';

const base = (clinicId: string) => `/clinics/${clinicId}/services`;

export const services = {
  /** List services (pass archived=true to include archived ones). */
  list(clinicId: string, params?: { archived?: boolean }) {
    return apiClient
      .get<Service[]>(base(clinicId), { params })
      .then((r) => r.data);
  },

  /** Get a single service. */
  get(clinicId: string, serviceId: string) {
    return apiClient
      .get<Service>(`${base(clinicId)}/${serviceId}`)
      .then((r) => r.data);
  },

  /** Create a new service. */
  create(clinicId: string, body: CreateServiceBody) {
    return apiClient
      .post<Service>(base(clinicId), body)
      .then((r) => r.data);
  },

  /** Update a service (price change archives the current version). */
  update(clinicId: string, serviceId: string, body: UpdateServiceBody) {
    return apiClient
      .patch<Service>(`${base(clinicId)}/${serviceId}`, body)
      .then((r) => r.data);
  },

  /** Soft-delete a service (sets archivedAt). */
  archive(clinicId: string, serviceId: string) {
    return apiClient
      .delete<void>(`${base(clinicId)}/${serviceId}`)
      .then((r) => r.data);
  },
};
