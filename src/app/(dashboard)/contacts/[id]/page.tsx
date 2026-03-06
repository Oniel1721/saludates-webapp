"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, MessageCircle } from "lucide-react";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { DevPanel } from "@/components/dev-panel";
import {
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  MOCK_CONVERSATIONS,
  STATUS_LABEL,
  STATUS_DOT,
  type Appointment,
} from "@/lib/mock";
import { formatPhone } from "@/lib/phone";

type PageState = "with-appointments" | "no-appointments";

const DEV_STATES = [
  { label: "Con historial",   value: "with-appointments" as PageState },
  { label: "Sin historial",   value: "no-appointments" as PageState },
];

export default function ContactProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const patient = MOCK_PATIENTS.find((p) => p.id === Number(id));

  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [pageState, setPageState] = useState<PageState>("with-appointments");

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-400">Paciente no encontrado.</p>
      </div>
    );
  }

  const patientAppointments =
    pageState === "no-appointments"
      ? []
      : appointments
          .filter((a) => a.patientPhone === patient.phone)
          .sort((a, b) => (a.date < b.date ? 1 : -1));

  const patientConversations = MOCK_CONVERSATIONS.filter(
    (c) => c.patientId === patient.id
  );

  function handleUpdate(apptId: number, changes: Partial<Appointment>) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, ...changes } : a))
    );
    if (selected?.id === apptId) {
      setSelected((prev) => (prev ? { ...prev, ...changes } : prev));
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <button onClick={() => router.back()} className="rounded-md p-1 hover:bg-zinc-100">
          <ChevronLeft className="h-5 w-5 text-zinc-500" />
        </button>
        <h1 className="text-sm font-semibold text-zinc-900">{patient.name}</h1>
      </header>

      <div className="flex flex-col divide-y divide-zinc-100">
        {/* Patient info */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-600">
              {patient.name.charAt(0)}
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900">{patient.name}</p>
              <a
                href={`https://wa.me/${patient.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
              >
                {formatPhone(patient.phone)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Conversations */}
        {patientConversations.length > 0 && (
          <div className="px-4 py-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Conversaciones
            </p>
            <div className="flex flex-col gap-2">
              {patientConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {conv.lastMessagePreview.length > 40
                          ? conv.lastMessagePreview.slice(0, 40) + "…"
                          : conv.lastMessagePreview}
                      </p>
                      <p className="text-xs text-zinc-400">{conv.lastMessageAgo}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-zinc-500">Ver →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Appointment history */}
        <div className="px-4 py-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Historial de citas
          </p>

          {patientAppointments.length === 0 ? (
            <p className="text-sm text-zinc-400">Este paciente no tiene citas registradas.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {patientAppointments.map((appt) => (
                <button
                  key={appt.id}
                  onClick={() => setSelected(appt)}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3 text-left hover:bg-zinc-50"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{appt.service}</p>
                    <p className="text-xs text-zinc-400">
                      {appt.date} · {appt.startTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[appt.status]}`} />
                    <span className="text-xs text-zinc-500">{STATUS_LABEL[appt.status]}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AppointmentDetailModal
        open={!!selected}
        appointment={selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
      />

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
