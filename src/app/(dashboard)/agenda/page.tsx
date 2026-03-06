"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AgendaHeader } from "@/components/agenda-header";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { CreateAppointmentModal } from "@/components/create-appointment-modal";
import { DevPanel } from "@/components/dev-panel";
import {
  MOCK_APPOINTMENTS,
  MOCK_TIME_BLOCKS,
  MOCK_SCHEDULE,
  STATUS_COLORS,
  STATUS_LABEL,
  STATUS_DOT,
  toDateString,
  type Appointment,
} from "@/lib/mock";

const HOUR_HEIGHT = 64; // px per hour

type PageState = "with-appointments" | "empty" | "closed-day" | "blocked-day";

const DEV_STATES = [
  { label: "Con citas",         value: "with-appointments" as PageState },
  { label: "Sin citas",         value: "empty" as PageState },
  { label: "Día cerrado",       value: "closed-day" as PageState },
  { label: "Día bloqueado",     value: "blocked-day" as PageState },
];

function getTop(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - MOCK_SCHEDULE.startHour) * HOUR_HEIGHT + (m * HOUR_HEIGHT) / 60;
}

function getHeight(minutes: number): number {
  return Math.max((minutes * HOUR_HEIGHT) / 60, 28);
}

const HOURS = Array.from(
  { length: MOCK_SCHEDULE.endHour - MOCK_SCHEDULE.startHour },
  (_, i) => MOCK_SCHEDULE.startHour + i
);

export default function AgendaDayPage() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pageState, setPageState] = useState<PageState>("with-appointments");

  const dateStr = toDateString(date);
  const dayOfWeek = date.getDay();
  const isClosed = !MOCK_SCHEDULE.workDays.includes(dayOfWeek);

  const dayAppointments = pageState === "with-appointments"
    ? appointments.filter((a) => a.date === dateStr)
    : [];

  const dayBlocks = pageState === "blocked-day"
    ? MOCK_TIME_BLOCKS.filter((b) => b.date === dateStr)
    : pageState === "with-appointments"
    ? MOCK_TIME_BLOCKS.filter((b) => b.date === dateStr)
    : [];

  const showClosed = pageState === "closed-day" || (pageState === "with-appointments" && isClosed);
  const isEmpty = pageState === "empty" || (!showClosed && dayAppointments.length === 0 && dayBlocks.length === 0);

  function handleUpdate(id: number, changes: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }

  function handleCreate(appt: Omit<Appointment, "id">) {
    const newAppt: Appointment = { ...appt, id: Date.now() };
    setAppointments((prev) => [...prev, newAppt]);
  }

  const totalHeight = HOURS.length * HOUR_HEIGHT;

  return (
    <div className="flex flex-col bg-white">
      <AgendaHeader date={date} onDateChange={setDate} />

      <div className="relative flex-1 overflow-y-auto">
        {showClosed ? (
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
                style={{ top: (h - MOCK_SCHEDULE.startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                <span className="w-14 shrink-0 pr-2 pt-1 text-right text-xs text-zinc-400">
                  {h}:00
                </span>
              </div>
            ))}

            {/* Blocked time slots */}
            {dayBlocks.map((block) => (
              <div
                key={block.id}
                className="absolute left-14 right-2 rounded-md"
                style={{
                  top: getTop(block.startTime),
                  height: getHeight(
                    (parseInt(block.endTime) - parseInt(block.startTime)) * 60
                  ),
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 8px)",
                  backgroundColor: "#f4f4f5",
                }}
              >
                <span className="px-2 pt-1 text-xs text-zinc-400">
                  {block.reason ?? "No disponible"}
                </span>
              </div>
            ))}

            {/* Appointments */}
            {dayAppointments.map((appt) => (
              <button
                key={appt.id}
                onClick={() => setSelected(appt)}
                className={`absolute left-14 right-2 rounded-md border px-2 py-1 text-left transition-opacity hover:opacity-80 ${STATUS_COLORS[appt.status]}`}
                style={{
                  top: getTop(appt.startTime),
                  height: getHeight(appt.durationMinutes),
                }}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[appt.status]}`} />
                  <span className="truncate text-xs font-medium">{appt.patientName}</span>
                </div>
                {appt.durationMinutes >= 30 && (
                  <p className="truncate text-xs opacity-70">{appt.service}</p>
                )}
                {appt.durationMinutes >= 30 && (
                  <p className="text-xs opacity-60">{appt.startTime} – {appt.endTime}</p>
                )}
              </button>
            ))}

            {/* Empty state */}
            {isEmpty && !showClosed && (
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
        onUpdate={handleUpdate}
      />

      <CreateAppointmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        defaultDate={dateStr}
      />

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
