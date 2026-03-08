import { apiClient } from '../client';
import type { Notification } from '../types';

const base = (clinicId: string) => `/clinics/${clinicId}/notifications`;

export const notifications = {
  /** List notifications. Pass unread=true to get only unread ones. */
  list(clinicId: string, params?: { unread?: boolean }) {
    return apiClient
      .get<Notification[]>(base(clinicId), { params })
      .then((r) => r.data);
  },

  /** Mark a single notification as read. */
  markRead(clinicId: string, notificationId: string) {
    return apiClient
      .post<Notification>(`${base(clinicId)}/${notificationId}/read`)
      .then((r) => r.data);
  },

  /** Mark all notifications as read. */
  markAllRead(clinicId: string) {
    return apiClient
      .post<void>(`${base(clinicId)}/read-all`)
      .then((r) => r.data);
  },
};
