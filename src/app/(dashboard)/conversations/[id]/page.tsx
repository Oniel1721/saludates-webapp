"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { useAuth } from "@/lib/auth-context";
import { useConversation, useResolveConversation } from "@/lib/hooks/use-conversations";
import { useCancelAppointment, useMarkResult } from "@/lib/hooks/use-appointments";
import { FLOW_LABEL } from "@/lib/constants";
import { formatPhone } from "@/lib/phone";
import type { Appointment } from "@/lib/api";

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { clinicId } = useAuth();

  const { data: conv, isLoading } = useConversation(clinicId ?? "", id);
  const resolveConversation = useResolveConversation(clinicId ?? "");
  const cancelMutation = useCancelAppointment(clinicId ?? "");
  const markResultMutation = useMarkResult(clinicId ?? "");

  const [apptDetailOpen, setApptDetailOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-base text-zinc-400">Conversación no encontrada.</p>
      </div>
    );
  }

  const isEscalated = conv.flow === "ESCALATED";
  const relatedAppt = conv.appointment ?? null;

  function handleResolve() {
    resolveConversation.mutate(conv!.id, { onSuccess: () => router.back() });
  }

  function handleApptCancel(apptId: string, reason?: string) {
    cancelMutation.mutate({ id: apptId, body: reason ? { reason } : undefined });
    setApptDetailOpen(false);
  }

  function handleApptMarkResult(apptId: string, result: "COMPLETED" | "NO_SHOW") {
    markResultMutation.mutate({ id: apptId, body: { status: result } });
    setApptDetailOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-500" />
        </button>
        <h1 className="text-base font-semibold text-zinc-900">{conv.patient.name}</h1>
      </header>

      <div className="flex flex-col gap-0 divide-y divide-zinc-100">
        {/* Escalation banner */}
        {isEscalated && (
          <div className="flex flex-col gap-3 bg-red-50 px-4 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-base font-semibold text-red-700">Conversación escalada</span>
            </div>
            <p className="text-sm text-red-600">El bot necesita tu atención.</p>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${conv.patient.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition-colors"
              >
                Abrir en WhatsApp
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={handleResolve}
                disabled={resolveConversation.isPending}
                className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 active:bg-red-200 disabled:opacity-50 transition-colors"
              >
                Resolver
              </button>
            </div>
          </div>
        )}

        {/* Current flow */}
        <div className="px-4 py-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Flujo actual
          </p>
          <p className="text-base text-zinc-800">{FLOW_LABEL[conv.flow]}</p>
        </div>

        {/* Recent messages */}
        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Últimos mensajes
          </p>
          <div className="flex flex-col gap-2">
            {conv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${msg.sender === "PATIENT" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.sender === "PATIENT"
                      ? "rounded-tr-sm bg-zinc-900 text-white"
                      : "rounded-tl-sm bg-zinc-100 text-zinc-800"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(msg.sentAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Related appointment */}
        {relatedAppt && (
          <div className="px-4 py-4">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Cita asociada
            </p>
            <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 hover:bg-zinc-50 transition-colors">
              <div>
                <p className="text-base font-medium text-zinc-900">{relatedAppt.service.name}</p>
                <p className="text-sm text-zinc-400">
                  {new Date(relatedAppt.startsAt).toLocaleDateString("es-DO")} ·{" "}
                  {new Date(relatedAppt.startsAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button
                onClick={() => setApptDetailOpen(true)}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Ver cita →
              </button>
            </div>
          </div>
        )}

        {/* Patient info */}
        <div className="px-4 py-4">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Paciente
          </p>
          <div className="flex items-center justify-between">
            <a
              href={`https://wa.me/${conv.patient.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-base text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              {formatPhone(conv.patient.phone)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href={`/contacts/${conv.patientId}`}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Ver perfil →
            </Link>
          </div>
        </div>
      </div>

      <AppointmentDetailModal
        open={apptDetailOpen}
        appointment={relatedAppt as Appointment | null}
        onClose={() => setApptDetailOpen(false)}
        onCancel={handleApptCancel}
        onMarkResult={handleApptMarkResult}
      />
    </div>
  );
}
