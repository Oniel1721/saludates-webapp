import { apiClient } from '../client';
import type {
  Appointment,
  CancelAppointmentBody,
  CreateAppointmentBody,
  MarkResultBody,
  UpdateAppointmentBody,
} from '../types';

const base = (clinicId: string) => `/clinics/${clinicId}/appointments`;

export const appointments = {
  /** List appointments, optionally filtered by date range. */
  list(clinicId: string, params?: { from?: string; to?: string }) {
    return apiClient
      .get<Appointment[]>(base(clinicId), { params })
      .then((r) => r.data);
  },

  /** Get a single appointment. */
  get(clinicId: string, appointmentId: string) {
    return apiClient
      .get<Appointment>(`${base(clinicId)}/${appointmentId}`)
      .then((r) => r.data);
  },

  /** Create a new appointment (secretary). */
  create(clinicId: string, body: CreateAppointmentBody) {
    return apiClient
      .post<Appointment>(base(clinicId), body)
      .then((r) => r.data);
  },

  /** Update an existing appointment. */
  update(clinicId: string, appointmentId: string, body: UpdateAppointmentBody) {
    return apiClient
      .patch<Appointment>(`${base(clinicId)}/${appointmentId}`, body)
      .then((r) => r.data);
  },

  /** Cancel an appointment. */
  cancel(clinicId: string, appointmentId: string, body: CancelAppointmentBody = {}) {
    return apiClient
      .post<Appointment>(`${base(clinicId)}/${appointmentId}/cancel`, body)
      .then((r) => r.data);
  },

  /** Mark appointment result as COMPLETED or NO_SHOW. */
  markResult(clinicId: string, appointmentId: string, body: MarkResultBody) {
    return apiClient
      .post<Appointment>(`${base(clinicId)}/${appointmentId}/result`, body)
      .then((r) => r.data);
  },
};
