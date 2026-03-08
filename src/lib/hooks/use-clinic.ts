import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UpdateClinicBody } from "@/lib/api";

const keys = {
  detail: (clinicId: string) => ["clinic", clinicId] as const,
};

export function useClinic(clinicId: string) {
  return useQuery({
    queryKey: keys.detail(clinicId),
    queryFn: () => api.clinics.get(clinicId),
    enabled: !!clinicId,
  });
}

export function useUpdateClinic(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateClinicBody) => api.clinics.update(clinicId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.detail(clinicId) }),
  });
}
