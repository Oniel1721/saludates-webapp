"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, ExternalLink } from "lucide-react";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { DevPanel } from "@/components/dev-panel";
import {
  MOCK_CONVERSATIONS,
  MOCK_APPOINTMENTS,
  FLOW_LABEL,
  type Appointment,
} from "@/lib/mock";
import { formatPhone } from "@/lib/phone";

type PageState = "normal" | "escalated" | "no-appointment";

const DEV_STATES = [
  { label: "Normal",           value: "normal" as PageState },
  { label: "Escalada",         value: "escalated" as PageState },
  { label: "Sin cita asociada", value: "no-appointment" as PageState },
];

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const base = MOCK_CONVERSATIONS.find((c) => c.id === Number(id));
  const [pageState, setPageState] = useState<PageState>(
    base?.isEscalated ? "escalated" : "normal"
  );
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [apptDetailOpen, setApptDetailOpen] = useState(false);

  if (!base) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-400">Conversación no encontrada.</p>
      </div>
    );
  }

  const conv = {
    ...base,
    isEscalated: pageState === "escalated",
    relatedAppointmentId: pageState === "no-appointment" ? undefined : base.relatedAppointmentId,
  };

  const relatedAppt = conv.relatedAppointmentId
    ? appointments.find((a) => a.id === conv.relatedAppointmentId)
    : undefined;

  function handleApptUpdate(apptId: number, changes: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === apptId ? { ...a, ...changes } : a)));
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <button onClick={() => router.back()} className="rounded-md p-1 hover:bg-zinc-100">
          <ChevronLeft className="h-5 w-5 text-zinc-500" />
        </button>
        <h1 className="text-sm font-semibold text-zinc-900">{conv.patientName}</h1>
      </header>

      <div className="flex flex-col gap-0 divide-y divide-zinc-100">
        {/* Escalation banner */}
        {conv.isEscalated && (
          <div className="flex flex-col gap-3 bg-red-50 px-4 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">Conversación escalada</span>
            </div>
            <p className="text-xs text-red-600">El bot necesita tu atención.</p>
            <a
              href={`https://wa.me/${conv.patientPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Abrir en WhatsApp
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Current flow */}
        <div className="px-4 py-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Flujo actual
          </p>
          <p className="text-sm text-zinc-800">{FLOW_LABEL[conv.flow]}</p>
        </div>

        {/* Recent messages */}
        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Últimos mensajes
          </p>
          <div className="flex flex-col gap-2">
            {conv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${msg.sender === "patient" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.sender === "patient"
                      ? "rounded-tr-sm bg-zinc-900 text-white"
                      : "rounded-tl-sm bg-zinc-100 text-zinc-800"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-400">{msg.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related appointment */}
        {relatedAppt && (
          <div className="px-4 py-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Cita asociada
            </p>
            <div className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">{relatedAppt.service}</p>
                <p className="text-xs text-zinc-400">
                  {relatedAppt.date} · {relatedAppt.startTime}
                </p>
              </div>
              <button
                onClick={() => setApptDetailOpen(true)}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
              >
                Ver cita →
              </button>
            </div>
          </div>
        )}

        {/* Patient info */}
        <div className="px-4 py-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Paciente
          </p>
          <div className="flex items-center justify-between">
            <a
              href={`https://wa.me/${conv.patientPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
            >
              {formatPhone(conv.patientPhone)}
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              href={`/contacts/${conv.patientId}`}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              Ver perfil →
            </Link>
          </div>
        </div>
      </div>

      <AppointmentDetailModal
        open={apptDetailOpen}
        appointment={relatedAppt ?? null}
        onClose={() => setApptDetailOpen(false)}
        onUpdate={handleApptUpdate}
      />

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
