"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AgendaHeader } from "@/components/agenda-header";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { CreateAppointmentModal } from "@/components/create-appointment-modal";
import { useAuth } from "@/lib/auth-context";
import { useAppointments, useCancelAppointment, useMarkResult } from "@/lib/hooks/use-appointments";
import { useSchedule } from "@/lib/hooks/use-availability";
import { STATUS_COLORS, STATUS_DOT } from "@/lib/mock";
import { getMondayOf, addDays, toDateString, localDate, localTime } from "@/lib/date-helpers";
import type { Appointment, Schedule } from "@/lib/api";

const HOUR_HEIGHT = 48;
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function deriveScheduleConfig(schedules: Schedule[]) {
  const active = schedules.filter((s) => s.isActive);
  if (active.length === 0) return { startHour: 8, endHour: 17, workDays: [] as number[] };
  const startHour = Math.min(...active.map((s) => parseInt(s.startTime)));
  const endHour = Math.max(...active.map((s) => parseInt(s.endTime)));
  return { startHour, endHour, workDays: active.map((s) => s.dayOfWeek) };
}

function getDurationMinutes(startsAt: string, endsAt: string) {
  return Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000);
}

function getTop(time: string, startHour: number): number {
  const [h, m] = time.split(":").map(Number);
  return (h - startHour) * HOUR_HEIGHT + (m * HOUR_HEIGHT) / 60;
}

function getHeight(minutes: number): number {
  return Math.max((minutes * HOUR_HEIGHT) / 60, 20);
}

export default function AgendaWeekPage() {
  const router = useRouter();
  const { clinicId } = useAuth();
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: appointments = [] } = useAppointments(clinicId ?? "");
  const { data: schedules = [] } = useSchedule(clinicId ?? "");
  const cancelMutation = useCancelAppointment(clinicId ?? "");
  const markResultMutation = useMarkResult(clinicId ?? "");

  const { startHour, endHour, workDays } = deriveScheduleConfig(schedules);
  const HOURS = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  const monday = getMondayOf(date);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = toDateString(new Date());

  function getAppts(dayStr: string) {
    return appointments.filter((a) => localDate(a.startsAt) === dayStr);
  }

  function handleCancel(id: string, reason?: string) {
    cancelMutation.mutate({ id, body: reason ? { reason } : undefined });
  }

  function handleMarkResult(id: string, result: "COMPLETED" | "NO_SHOW") {
    markResultMutation.mutate({ id, body: { status: result } });
  }

  return (
    <div className="flex flex-col bg-white">
      <AgendaHeader date={date} onDateChange={setDate} />

      <div className="flex overflow-x-auto">
        {/* Time column */}
        <div className="shrink-0 w-10">
          <div className="h-10 border-b border-zinc-100" />
          <div className="relative" style={{ height: totalHeight }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0"
                style={{ top: (h - startHour) * HOUR_HEIGHT }}
              >
                <span className="block pr-1 pt-0.5 text-right text-[10px] text-zinc-400 leading-none">
                  {h}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        {weekDays.map((day, i) => {
          const dayStr = toDateString(day);
          const isToday = dayStr === today;
          const isClosed = workDays.length > 0 && !workDays.includes(day.getDay());
          const appts = getAppts(dayStr);

          return (
            <div key={dayStr} className="flex-1 min-w-0 border-l border-zinc-100">
              {/* Day header */}
              <button
                onClick={() => { setDate(day); router.push("/agenda"); }}
                className={`flex h-10 w-full flex-col items-center justify-center border-b border-zinc-100 text-center hover:bg-zinc-50 ${
                  isToday ? "bg-zinc-900" : ""
                }`}
              >
                <span className={`text-[10px] font-medium ${isToday ? "text-white" : "text-zinc-400"}`}>
                  {DAY_LABELS[i]}
                </span>
                <span className={`text-xs font-semibold ${isToday ? "text-white" : "text-zinc-700"}`}>
                  {day.getDate()}
                </span>
              </button>

              {/* Hour cells */}
              <div
                className={`relative ${isClosed ? "bg-zinc-50" : ""}`}
                style={{ height: totalHeight }}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-zinc-100"
                    style={{ top: (h - startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}

                {isClosed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-zinc-300 -rotate-90 whitespace-nowrap">Cerrado</span>
                  </div>
                )}

                {appts.map((appt) => {
                  const duration = getDurationMinutes(appt.startsAt, appt.endsAt);
                  return (
                    <button
                      key={appt.id}
                      onClick={() => setSelected(appt)}
                      className={`absolute inset-x-0.5 rounded-sm border px-1 text-left transition-opacity hover:opacity-75 ${STATUS_COLORS[appt.status]}`}
                      style={{
                        top: getTop(localTime(appt.startsAt), startHour),
                        height: getHeight(duration),
                      }}
                    >
                      <div className="flex items-center gap-0.5 overflow-hidden">
                        <span className={`h-1 w-1 shrink-0 rounded-full ${STATUS_DOT[appt.status]}`} />
                        <span className="truncate text-[10px] font-medium leading-tight">
                          {appt.patient.name.split(" ")[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
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
      />
    </div>
  );
}
