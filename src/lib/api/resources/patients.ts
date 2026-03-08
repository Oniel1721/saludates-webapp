import { apiClient } from '../client';
import type { Appointment, Patient, UpdatePatientBody } from '../types';

const base = (clinicId: string) => `/clinics/${clinicId}/patients`;

export interface PatientDetail extends Patient {
  appointments: Appointment[];
}

export const patients = {
  /** List patients, optionally filtered by name or phone. */
  list(clinicId: string, params?: { search?: string }) {
    return apiClient
      .get<Patient[]>(base(clinicId), { params })
      .then((r) => r.data);
  },

  /** Get a patient with their full appointment history. */
  get(clinicId: string, patientId: string) {
    return apiClient
      .get<PatientDetail>(`${base(clinicId)}/${patientId}`)
      .then((r) => r.data);
  },

  /** Update a patient's name. */
  update(clinicId: string, patientId: string, body: UpdatePatientBody) {
    return apiClient
      .patch<Patient>(`${base(clinicId)}/${patientId}`, body)
      .then((r) => r.data);
  },
};
