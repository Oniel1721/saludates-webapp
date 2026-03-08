import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CancelAppointmentBody, CreateAppointmentBody, MarkResultBody, UpdateAppointmentBody } from "@/lib/api";

export const appointmentKeys = {
  all: (clinicId: string) => ["appointments", clinicId] as const,
  list: (clinicId: string, from?: string, to?: string) =>
    ["appointments", clinicId, { from, to }] as const,
  detail: (clinicId: string, id: string) => ["appointments", clinicId, id] as const,
};

export function useAppointments(clinicId: string, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: appointmentKeys.list(clinicId, params?.from, params?.to),
    queryFn: () => api.appointments.list(clinicId, params),
    enabled: !!clinicId,
  });
}

export function useAppointment(clinicId: string, appointmentId: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(clinicId, appointmentId),
    queryFn: () => api.appointments.get(clinicId, appointmentId),
    enabled: !!clinicId && !!appointmentId,
  });
}

export function useCreateAppointment(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAppointmentBody) => api.appointments.create(clinicId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all(clinicId) }),
  });
}

export function useUpdateAppointment(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAppointmentBody }) =>
      api.appointments.update(clinicId, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all(clinicId) }),
  });
}

export function useCancelAppointment(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: CancelAppointmentBody }) =>
      api.appointments.cancel(clinicId, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all(clinicId) }),
  });
}

export function useMarkResult(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MarkResultBody }) =>
      api.appointments.markResult(clinicId, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all(clinicId) }),
  });
}
