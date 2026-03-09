import type { AppointmentStatus, ConversationFlow } from '@/lib/api';

// ─── Appointment display helpers ──────────────────────────────────────────────

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING:   'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW:   'No asistió',
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING:   'bg-amber-50 border-amber-300 text-amber-800',
  CONFIRMED: 'bg-emerald-50 border-emerald-300 text-emerald-800',
  CANCELLED: 'bg-zinc-100 border-zinc-200 text-zinc-400',
  COMPLETED: 'bg-blue-50 border-blue-200 text-blue-800',
  NO_SHOW:   'bg-red-50 border-red-200 text-red-700',
};

export const STATUS_DOT: Record<AppointmentStatus, string> = {
  PENDING:   'bg-amber-400',
  CONFIRMED: 'bg-emerald-500',
  CANCELLED: 'bg-zinc-300',
  COMPLETED: 'bg-blue-400',
  NO_SHOW:   'bg-red-400',
};

// ─── Conversation display helpers ─────────────────────────────────────────────

export const FLOW_LABEL: Record<ConversationFlow, string> = {
  CREATING_APPOINTMENT: 'Agendando cita',
  CONFIRMING:           'Esperando confirmación',
  CANCELLING:           'Cancelando cita',
  RESCHEDULING:         'Reagendando cita',
  QUERYING_SERVICES:    'Consultando servicios',
  OUT_OF_FLOW:          'Fuera del flujo',
  ESCALATED:            'Escalada',
};
