import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const keys = {
  all: (clinicId: string) => ["patients", clinicId] as const,
  list: (clinicId: string, search?: string) => ["patients", clinicId, { search }] as const,
  detail: (clinicId: string, id: string) => ["patients", clinicId, id] as const,
};

export function usePatients(clinicId: string, search?: string) {
  return useQuery({
    queryKey: keys.list(clinicId, search),
    queryFn: () => api.patients.list(clinicId, search ? { search } : undefined),
    enabled: !!clinicId,
  });
}

export function usePatient(clinicId: string, patientId: string) {
  return useQuery({
    queryKey: keys.detail(clinicId, patientId),
    queryFn: () => api.patients.get(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
  });
}
