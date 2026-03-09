// ─── Enums ────────────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type CreatedBy = 'SECRETARY' | 'BOT';
export type CancelledBy = 'PATIENT' | 'SECRETARY';
export type WhatsAppStatus = 'DISCONNECTED' | 'PENDING_QR' | 'CONNECTED';
export type SessionStatus = 'connecting' | 'connected' | 'disconnected' | 'need_scan' | 'logged_out' | 'expired';
export type UserRole = 'SUPERADMIN' | 'CLINIC_USER';

export type ConversationFlow =
  | 'CREATING_APPOINTMENT'
  | 'CONFIRMING'
  | 'CANCELLING'
  | 'RESCHEDULING'
  | 'QUERYING_SERVICES'
  | 'OUT_OF_FLOW'
  | 'ESCALATED';

export type MessageSender = 'PATIENT' | 'BOT' | 'SECRETARY';

export type MessageType =
  | 'TEXT'
  | 'AUDIO'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'STICKER'
  | 'LOCATION'
  | 'CONTACT'
  | 'UNSUPPORTED';

export type NotificationType =
  | 'ESCALATION'
  | 'ESCALATION_SECRETARY_REPLY'
  | 'UNCONFIRMED_2H'
  | 'RESULT_NEEDED';

// ─── Models ───────────────────────────────────────────────────────────────────

export interface Clinic {
  id: string;
  name: string;
  address: string;
  authorizedEmails: string[];
  whatsappPhone: string | null;
  whatsappStatus: WhatsAppStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  clinicId: string;
  name: string;
  price: number;
  durationMinutes: number;
  prerequisites: string | null;
  archivedAt: string | null;
  parentServiceId: string | null;
  createdAt: string;
}

export interface Schedule {
  id: string;
  clinicId: string;
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  isActive: boolean;
}

export interface TimeBlock {
  id: string;
  clinicId: string;
  startDatetime: string;
  endDatetime: string;
  reason: string | null;
  createdAt: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  price: number;
  status: AppointmentStatus;
  createdBy: CreatedBy;
  reminderSentAt: string | null;
  cancelledBy: CancelledBy | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  service: Service;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  type: MessageType;
  text: string | null;
  mediaUrl: string | null;
  contentType: string | null;
  sentAt: string;
}

export interface Conversation {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  flow: ConversationFlow;
  flowState: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  messages: Message[];
}

export interface ConversationDetail extends Conversation {
  appointment: (Appointment & { service: Service }) | null;
}

export interface Notification {
  id: string;
  clinicId: string;
  type: NotificationType;
  title: string;
  body: string;
  appointmentId: string | null;
  conversationId: string | null;
  readAt: string | null;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  email: string;
  role: UserRole;
  clinicId: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface SlotCheckResult {
  available: boolean;
  reason?: string;
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

export interface WhatsAppStatusResponse {
  status: SessionStatus;
  phone: string | null;
  qrCode: string | null; // base64 QR image, only when status = PENDING_QR
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface GoogleVerifyBody {
  idToken: string;
}

export interface CreateAppointmentBody {
  patientName: string;
  patientPhone: string;
  serviceId: string;
  startsAt: string; // ISO 8601
  price?: number;
}

export interface UpdateAppointmentBody {
  patientName?: string;
  serviceId?: string;
  startsAt?: string;
  price?: number;
}

export interface CancelAppointmentBody {
  reason?: string;
}

export interface MarkResultBody {
  status: 'COMPLETED' | 'NO_SHOW';
}

export interface CreateServiceBody {
  name: string;
  price: number;
  durationMinutes: number;
  prerequisites?: string;
}

export interface UpdateServiceBody {
  name?: string;
  price?: number;
  durationMinutes?: number;
  prerequisites?: string;
}

export interface ScheduleDayInput {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
}

export interface BulkScheduleBody {
  schedule: ScheduleDayInput[];
}

export interface UpdateScheduleDayBody {
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface CreateTimeBlockBody {
  startDatetime: string; // ISO 8601
  endDatetime: string;
  reason?: string;
}

export interface UpdatePatientBody {
  name: string;
}

export interface UpdateClinicBody {
  name?: string;
  address?: string;
}

export interface CreateClinicBody {
  name: string;
  address: string;
  authorizedEmails: string[];
}

export interface ConnectWhatsAppBody {
  phone: string;
}
