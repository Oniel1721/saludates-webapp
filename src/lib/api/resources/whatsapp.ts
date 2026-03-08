import { apiClient } from '../client';
import type { ConnectWhatsAppBody, WhatsAppStatusResponse } from '../types';

const base = (clinicId: string) => `/clinics/${clinicId}/whatsapp`;

export const whatsapp = {
  /** Initiate a new WhatsApp session. Returns a QR code to scan. */
  connect(clinicId: string, body: ConnectWhatsAppBody) {
    return apiClient
      .post<WhatsAppStatusResponse>(`${base(clinicId)}/connect`, body)
      .then((r) => r.data);
  },

  /** Get the current WhatsApp connection status (and QR if pending). */
  getStatus(clinicId: string) {
    return apiClient
      .get<WhatsAppStatusResponse>(`${base(clinicId)}/status`)
      .then((r) => r.data);
  },

  /** Disconnect the current WhatsApp session. */
  disconnect(clinicId: string) {
    return apiClient
      .delete<void>(`${base(clinicId)}/disconnect`)
      .then((r) => r.data);
  },
};
