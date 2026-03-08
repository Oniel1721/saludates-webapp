import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const keys = {
  all: (clinicId: string) => ["notifications", clinicId] as const,
};

export function useNotifications(clinicId: string, unread?: boolean) {
  return useQuery({
    queryKey: [...keys.all(clinicId), { unread }],
    queryFn: () => api.notifications.list(clinicId, unread ? { unread } : undefined),
    enabled: !!clinicId,
  });
}

export function useMarkNotificationRead(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      api.notifications.markRead(clinicId, notificationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(clinicId) }),
  });
}

export function useMarkAllNotificationsRead(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.notifications.markAllRead(clinicId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(clinicId) }),
  });
}
