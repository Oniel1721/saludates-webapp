export { tokenStore } from './client';
export * from './types';

import { auth } from './resources/auth';
import { clinics } from './resources/clinics';
import { appointments } from './resources/appointments';
import { availability } from './resources/availability';
import { services } from './resources/services';
import { patients } from './resources/patients';
import { conversations } from './resources/conversations';
import { notifications } from './resources/notifications';
import { whatsapp } from './resources/whatsapp';

export const api = {
  auth,
  clinics,
  appointments,
  availability,
  services,
  patients,
  conversations,
  notifications,
  whatsapp,
};
