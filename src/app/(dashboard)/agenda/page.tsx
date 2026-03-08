"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { AgendaHeader } from "@/components/agenda-header";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { CreateAppointmentModal } from "@/components/create-appointment-modal";
import { useAuth } from "@/lib/auth-context";
import { useAppointments, useCancelAppointment, useMarkResult } from "@/lib/hooks/use-appointments";
import { useSchedule } from "@/lib/hooks/use-availability";
import type { Appointment, Schedule } from "@/lib/api";
import { STATUS_COLORS, STATUS_DOT } from "@/lib/mock";
import { localDate, localTime, toDateString } from "@/lib/date-helpers";

const HOUR_HEIGHT = 64; // px per hour

function deriveScheduleConfig(schedules: Schedule[]) {
  const active = schedules.filter((s) => s.isActive);
  if (active.length === 0) {
    return { startHour: 8, endHour: 17, workDays: [] as number[] };
  }
  const startHour = Math.min(...active.map((s) => parseInt(s.startTime)));
  const endHour = Math.max(...active.map((s) => parseInt(s.endTime)));
  const workDays = active.map((s) => s.dayOfWeek);
  return { startHour, endHour, workDays };
}

function getDurationMinutes(startsAt: string, endsAt: string) {
  return Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000);
}

function getTop(time: string, startHour: number): number {
  const [h, m] = time.split(":").map(Number);
  return (h - startHour) * HOUR_HEIGHT + (m * HOUR_HEIGHT) / 60;
}

function getHeight(minutes: number): number {
  return Math.max((minutes * HOUR_HEIGHT) / 60, 28);
}

export default function AgendaDayPage() {
  const { clinicId } = useAuth();
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: appointments = [], isLoading: apptLoading } = useAppointments(clinicId ?? "");
  const { data: schedules = [], isLoading: schedLoading } = useSchedule(clinicId ?? "");
  const cancelMutation = useCancelAppointment(clinicId ?? "");
  const markResultMutation = useMarkResult(clinicId ?? "");

  const { startHour, endHour, workDays } = deriveScheduleConfig(schedules);
  const HOURS = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  const dateStr = toDateString(date);
  const dayOfWeek = date.getDay();
  const isClosed = workDays.length > 0 && !workDays.includes(dayOfWeek);

  const dayAppointments = appointments.filter((a) => localDate(a.startsAt) === dateStr);

  const isLoading = apptLoading || schedLoading;

  function handleCancel(id: string, reason?: string) {
    cancelMutation.mutate({ id, body: reason ? { reason } : undefined });
  }

  function handleMarkResult(id: string, result: "COMPLETED" | "NO_SHOW") {
    markResultMutation.mutate({ id, body: { status: result } });
  }

  return (
    <div className="flex flex-col bg-white">
      <AgendaHeader date={date} onDateChange={setDate} />

      <div className="relative flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
          </div>
        ) : isClosed ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-zinc-400">El consultorio no atiende este día.</p>
          </div>
        ) : (
          <div className="relative" style={{ height: totalHeight }}>
            {/* Hour grid */}
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start border-t border-zinc-100"
                style={{ top: (h - startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                <span className="w-14 shrink-0 pr-2 pt-1 text-right text-xs text-zinc-400">
                  {h}:00
                </span>
              </div>
            ))}

            {/* Appointments */}
            {dayAppointments.map((appt) => {
              const duration = getDurationMinutes(appt.startsAt, appt.endsAt);
              const h = getHeight(duration);
              const startTime = localTime(appt.startsAt);
              const endTime = localTime(appt.endsAt);
              return (
                <button
                  key={appt.id}
                  onClick={() => setSelected(appt)}
                  className={`absolute left-14 right-2 overflow-hidden rounded-md border px-2 py-1 text-left transition-opacity hover:opacity-80 ${STATUS_COLORS[appt.status]}`}
                  style={{
                    top: getTop(startTime, startHour),
                    height: h,
                  }}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[appt.status]}`} />
                    <span className="truncate text-xs font-medium">{appt.patient.name}</span>
                  </div>
                  {h >= 42 && (
                    <p className="truncate text-xs opacity-70">{appt.service.name}</p>
                  )}
                  {h >= 56 && (
                    <p className="text-xs opacity-60">{startTime} – {endTime}</p>
                  )}
                </button>
              );
            })}

            {/* Empty state */}
            {dayAppointments.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-zinc-400">No hay citas para este día.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-20 right-4 flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-zinc-800"
      >
        <Plus className="h-4 w-4" />
        Nueva cita
      </button>

      <AppointmentDetailModal
        open={!!selected}
        appointment={selected}
        onClose={() => setSelected(null)}
        onCancel={handleCancel}
        onMarkResult={handleMarkResult}
      />

      <CreateAppointmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={() => setCreateOpen(false)}
        defaultDate={dateStr}
      />
    </div>
  );
}
