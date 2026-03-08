import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BulkScheduleBody, CreateTimeBlockBody } from "@/lib/api";

const keys = {
  schedule: (clinicId: string) => ["schedule", clinicId] as const,
  timeBlocks: (clinicId: string) => ["time-blocks", clinicId] as const,
  slots: (clinicId: string, date: string, serviceId: string) =>
    ["slots", clinicId, date, serviceId] as const,
};

export function useSchedule(clinicId: string) {
  return useQuery({
    queryKey: keys.schedule(clinicId),
    queryFn: () => api.availability.getSchedule(clinicId),
    enabled: !!clinicId,
  });
}

export function useUpsertSchedule(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkScheduleBody) => api.availability.upsertSchedule(clinicId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.schedule(clinicId) }),
  });
}

export function useTimeBlocks(clinicId: string) {
  return useQuery({
    queryKey: keys.timeBlocks(clinicId),
    queryFn: () => api.availability.listTimeBlocks(clinicId),
    enabled: !!clinicId,
  });
}

export function useCreateTimeBlock(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTimeBlockBody) => api.availability.createTimeBlock(clinicId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.timeBlocks(clinicId) }),
  });
}

export function useDeleteTimeBlock(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => api.availability.deleteTimeBlock(clinicId, blockId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.timeBlocks(clinicId) }),
  });
}

export function useSlots(clinicId: string, date: string, serviceId: string) {
  return useQuery({
    queryKey: keys.slots(clinicId, date, serviceId),
    queryFn: () => api.availability.getSlots(clinicId, { date, serviceId }),
    enabled: !!clinicId && !!date && !!serviceId,
  });
}
