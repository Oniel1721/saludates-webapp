"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AgendaHeader } from "@/components/agenda-header";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { CreateAppointmentModal } from "@/components/create-appointment-modal";
import { DevPanel } from "@/components/dev-panel";
import {
  MOCK_APPOINTMENTS,
  MOCK_SCHEDULE,
  STATUS_COLORS,
  STATUS_DOT,
  getMondayOf,
  addDays,
  toDateString,
  type Appointment,
} from "@/lib/mock";

const HOUR_HEIGHT = 48;

const HOURS = Array.from(
  { length: MOCK_SCHEDULE.endHour - MOCK_SCHEDULE.startHour },
  (_, i) => MOCK_SCHEDULE.startHour + i
);

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type PageState = "with-appointments" | "empty";

const DEV_STATES = [
  { label: "Con citas",  value: "with-appointments" as PageState },
  { label: "Sin citas",  value: "empty" as PageState },
];

function getTop(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - MOCK_SCHEDULE.startHour) * HOUR_HEIGHT + (m * HOUR_HEIGHT) / 60;
}

function getHeight(minutes: number): number {
  return Math.max((minutes * HOUR_HEIGHT) / 60, 20);
}

export default function AgendaWeekPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pageState, setPageState] = useState<PageState>("with-appointments");

  const monday = getMondayOf(date);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = toDateString(new Date());

  function getAppts(dayStr: string) {
    if (pageState === "empty") return [];
    return appointments.filter((a) => a.date === dayStr);
  }

  function handleUpdate(id: number, changes: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }

  function handleCreate(appt: Omit<Appointment, "id">) {
    setAppointments((prev) => [...prev, { ...appt, id: Date.now() }]);
  }

  const totalHeight = HOURS.length * HOUR_HEIGHT;

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
                style={{ top: (h - MOCK_SCHEDULE.startHour) * HOUR_HEIGHT }}
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
          const isClosed = !MOCK_SCHEDULE.workDays.includes(day.getDay());
          const appts = getAppts(dayStr);

          return (
            <div key={dayStr} className="flex-1 min-w-0 border-l border-zinc-100">
              {/* Day header */}
              <button
                onClick={() => router.push("/agenda")}
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
                    style={{ top: (h - MOCK_SCHEDULE.startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}

                {isClosed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-zinc-300 rotate-[-90deg] whitespace-nowrap">Cerrado</span>
                  </div>
                )}

                {appts.map((appt) => (
                  <button
                    key={appt.id}
                    onClick={() => setSelected(appt)}
                    className={`absolute inset-x-0.5 rounded-sm border px-1 text-left transition-opacity hover:opacity-75 ${STATUS_COLORS[appt.status]}`}
                    style={{
                      top: getTop(appt.startTime),
                      height: getHeight(appt.durationMinutes),
                    }}
                  >
                    <div className="flex items-center gap-0.5 overflow-hidden">
                      <span className={`h-1 w-1 shrink-0 rounded-full ${STATUS_DOT[appt.status]}`} />
                      <span className="truncate text-[10px] font-medium leading-tight">
                        {appt.patientName.split(" ")[0]}
                      </span>
                    </div>
                  </button>
                ))}
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
        onUpdate={handleUpdate}
      />

      <CreateAppointmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
