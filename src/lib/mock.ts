export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show";

export type Appointment = {
  id: number;
  patientName: string;
  patientPhone: string; // raw: "18091234567"
  service: string;
  serviceId: number;
  date: string;           // "2026-03-06"
  startTime: string;      // "08:00"
  endTime: string;        // "08:30"
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  createdBy: "secretary" | "bot";
  cancelReason?: string;
  cancelledAt?: string;
};

export type Patient = {
  id: number;
  name: string;
  phone: string; // raw
};

export type Service = {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
};

export type TimeBlock = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

// ─── Services ────────────────────────────────────────────────────────────────

export const MOCK_SERVICES: Service[] = [
  { id: 1, name: "Consulta general",       price: 1500, durationMinutes: 30 },
  { id: 2, name: "Consulta de seguimiento", price: 1000, durationMinutes: 20 },
  { id: 3, name: "Espirometría",            price: 2500, durationMinutes: 45 },
];

// ─── Patients ─────────────────────────────────────────────────────────────────

export const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: "Juan Pérez",       phone: "18091234567" },
  { id: 2, name: "María Rodríguez",  phone: "18291234567" },
  { id: 3, name: "Carlos Martínez",  phone: "18491234567" },
  { id: 4, name: "Ana García",       phone: "18091234568" },
  { id: 5, name: "Luis Sánchez",     phone: "18291234568" },
];

// ─── Appointments (week of Mar 2–8 2026) ──────────────────────────────────────

export const MOCK_APPOINTMENTS: Appointment[] = [
  // Monday Mar 2
  { id: 1,  patientName: "Juan Pérez",      patientPhone: "18091234567", service: "Consulta general",        serviceId: 1, date: "2026-03-02", startTime: "08:00", endTime: "08:30", durationMinutes: 30, price: 1500, status: "completed",  createdBy: "secretary" },
  { id: 2,  patientName: "María Rodríguez", patientPhone: "18291234567", service: "Consulta de seguimiento", serviceId: 2, date: "2026-03-02", startTime: "09:00", endTime: "09:20", durationMinutes: 20, price: 1000, status: "completed",  createdBy: "bot" },
  { id: 3,  patientName: "Carlos Martínez", patientPhone: "18491234567", service: "Espirometría",            serviceId: 3, date: "2026-03-02", startTime: "10:00", endTime: "10:45", durationMinutes: 45, price: 2500, status: "no-show",   createdBy: "bot" },

  // Tuesday Mar 3
  { id: 4,  patientName: "Ana García",      patientPhone: "18091234568", service: "Consulta general",        serviceId: 1, date: "2026-03-03", startTime: "08:30", endTime: "09:00", durationMinutes: 30, price: 1500, status: "completed",  createdBy: "secretary" },
  { id: 5,  patientName: "Luis Sánchez",    patientPhone: "18291234568", service: "Espirometría",            serviceId: 3, date: "2026-03-03", startTime: "14:00", endTime: "14:45", durationMinutes: 45, price: 2500, status: "cancelled",  createdBy: "bot", cancelReason: "Paciente canceló", cancelledAt: "2026-03-02T10:00:00" },

  // Wednesday Mar 4
  { id: 6,  patientName: "Juan Pérez",      patientPhone: "18091234567", service: "Consulta de seguimiento", serviceId: 2, date: "2026-03-04", startTime: "09:00", endTime: "09:20", durationMinutes: 20, price: 1000, status: "completed",  createdBy: "bot" },
  { id: 7,  patientName: "Carlos Martínez", patientPhone: "18491234567", service: "Consulta general",        serviceId: 1, date: "2026-03-04", startTime: "11:00", endTime: "11:30", durationMinutes: 30, price: 1500, status: "completed",  createdBy: "secretary" },

  // Thursday Mar 5
  { id: 8,  patientName: "María Rodríguez", patientPhone: "18291234567", service: "Consulta general",        serviceId: 1, date: "2026-03-05", startTime: "08:00", endTime: "08:30", durationMinutes: 30, price: 1500, status: "completed",  createdBy: "bot" },
  { id: 9,  patientName: "Ana García",      patientPhone: "18091234568", service: "Espirometría",            serviceId: 3, date: "2026-03-05", startTime: "10:00", endTime: "10:45", durationMinutes: 45, price: 2500, status: "no-show",   createdBy: "secretary" },

  // Friday Mar 6 (TODAY) — mix of all states
  { id: 10, patientName: "Juan Pérez",      patientPhone: "18091234567", service: "Consulta general",        serviceId: 1, date: "2026-03-06", startTime: "08:00", endTime: "08:30", durationMinutes: 30, price: 1500, status: "completed",  createdBy: "secretary" },
  { id: 11, patientName: "María Rodríguez", patientPhone: "18291234567", service: "Consulta de seguimiento", serviceId: 2, date: "2026-03-06", startTime: "09:00", endTime: "09:20", durationMinutes: 20, price: 1000, status: "confirmed",  createdBy: "bot" },
  { id: 12, patientName: "Carlos Martínez", patientPhone: "18491234567", service: "Espirometría",            serviceId: 3, date: "2026-03-06", startTime: "10:00", endTime: "10:45", durationMinutes: 45, price: 2500, status: "no-show",   createdBy: "secretary" },
  { id: 13, patientName: "Ana García",      patientPhone: "18091234568", service: "Consulta general",        serviceId: 1, date: "2026-03-06", startTime: "14:00", endTime: "14:30", durationMinutes: 30, price: 1500, status: "pending",    createdBy: "bot" },
  { id: 14, patientName: "Luis Sánchez",    patientPhone: "18291234568", service: "Consulta general",        serviceId: 1, date: "2026-03-06", startTime: "15:30", endTime: "16:00", durationMinutes: 30, price: 1500, status: "cancelled",  createdBy: "secretary", cancelReason: "Doctor salió temprano", cancelledAt: "2026-03-06T08:00:00" },
];

// ─── Blocked time slots ───────────────────────────────────────────────────────

export const MOCK_TIME_BLOCKS: TimeBlock[] = [
  { id: 1, date: "2026-03-06", startTime: "12:00", endTime: "13:00", reason: "Almuerzo" },
];

// ─── Schedule ─────────────────────────────────────────────────────────────────

export const MOCK_SCHEDULE = {
  startHour: 8,
  endHour: 17,
  workDays: [1, 2, 3, 4, 5], // Mon–Fri (0 = Sun)
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending:   "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  "no-show": "No asistió",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending:   "bg-amber-50 border-amber-300 text-amber-800",
  confirmed: "bg-emerald-50 border-emerald-300 text-emerald-800",
  cancelled: "bg-zinc-100 border-zinc-200 text-zinc-400",
  completed: "bg-blue-50 border-blue-200 text-blue-800",
  "no-show": "bg-red-50 border-red-200 text-red-700",
};

export const STATUS_DOT: Record<AppointmentStatus, string> = {
  pending:   "bg-amber-400",
  confirmed: "bg-emerald-500",
  cancelled: "bg-zinc-300",
  completed: "bg-blue-400",
  "no-show": "bg-red-400",
};

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatDateHeader(date: Date): string {
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  return `${monday.getDate()} – ${sunday.getDate()} de ${sunday.toLocaleDateString("es-DO", { month: "long", year: "numeric" })}`;
}

export function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date());
}
