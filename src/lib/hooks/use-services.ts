import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateServiceBody, UpdateServiceBody } from "@/lib/api";

const keys = {
  all: (clinicId: string) => ["services", clinicId] as const,
};

export function useServices(clinicId: string) {
  return useQuery({
    queryKey: keys.all(clinicId),
    queryFn: () => api.services.list(clinicId),
    enabled: !!clinicId,
  });
}

export function useCreateService(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateServiceBody) => api.services.create(clinicId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(clinicId) }),
  });
}

export function useUpdateService(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateServiceBody }) =>
      api.services.update(clinicId, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(clinicId) }),
  });
}

export function useArchiveService(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.services.archive(clinicId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(clinicId) }),
  });
}
