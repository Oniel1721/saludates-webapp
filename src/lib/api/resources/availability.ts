import { apiClient } from '../client';
import type {
  BulkScheduleBody,
  CreateTimeBlockBody,
  Schedule,
  SlotCheckResult,
  TimeBlock,
  UpdateScheduleDayBody,
} from '../types';

const scheduleBase = (clinicId: string) => `/clinics/${clinicId}/schedule`;
const blocksBase = (clinicId: string) => `/clinics/${clinicId}/time-blocks`;
const slotsBase = (clinicId: string) => `/clinics/${clinicId}/availability`;

export const availability = {
  // ── Schedule ────────────────────────────────────────────────────────────────

  /** Get the full weekly schedule (7 days). */
  getSchedule(clinicId: string) {
    return apiClient
      .get<Schedule[]>(scheduleBase(clinicId))
      .then((r) => r.data);
  },

  /** Replace the full weekly schedule in one request. */
  upsertSchedule(clinicId: string, body: BulkScheduleBody) {
    return apiClient
      .put<Schedule[]>(scheduleBase(clinicId), body)
      .then((r) => r.data);
  },

  /** Update a single day of the schedule. */
  updateDay(clinicId: string, dayOfWeek: number, body: UpdateScheduleDayBody) {
    return apiClient
      .patch<Schedule>(`${scheduleBase(clinicId)}/${dayOfWeek}`, body)
      .then((r) => r.data);
  },

  // ── Time blocks ─────────────────────────────────────────────────────────────

  /** List time blocks (pass upcoming=true to get only future ones). */
  listTimeBlocks(clinicId: string, upcoming = true) {
    return apiClient
      .get<TimeBlock[]>(blocksBase(clinicId), { params: { upcoming } })
      .then((r) => r.data);
  },

  /** Create a new time block (holiday, lunch break, etc.). */
  createTimeBlock(clinicId: string, body: CreateTimeBlockBody) {
    return apiClient
      .post<TimeBlock>(blocksBase(clinicId), body)
      .then((r) => r.data);
  },

  /** Delete a time block. */
  deleteTimeBlock(clinicId: string, blockId: string) {
    return apiClient
      .delete<void>(`${blocksBase(clinicId)}/${blockId}`)
      .then((r) => r.data);
  },

  // ── Slot queries ─────────────────────────────────────────────────────────────

  /** Check if a specific time slot is available. */
  checkSlot(clinicId: string, params: { startsAt: string; endsAt: string }) {
    return apiClient
      .get<SlotCheckResult>(`${slotsBase(clinicId)}/check`, { params })
      .then((r) => r.data);
  },

  /** Get all available slots for a given date and service. */
  getSlots(clinicId: string, params: { date: string; serviceId: string }) {
    return apiClient
      .get<string[]>(`${slotsBase(clinicId)}/slots`, { params })
      .then((r) => r.data);
  },
};
