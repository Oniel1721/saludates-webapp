"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, MessageCircle, Loader2 } from "lucide-react";
import { AppointmentDetailModal } from "@/components/appointment-detail-modal";
import { useAuth } from "@/lib/auth-context";
import { usePatient } from "@/lib/hooks/use-patients";
import { useAppointments, useCancelAppointment, useMarkResult } from "@/lib/hooks/use-appointments";
import { useConversations } from "@/lib/hooks/use-conversations";
import { STATUS_LABEL, STATUS_DOT } from "@/lib/constants";
import { localDate, localTime, timeAgo } from "@/lib/date-helpers";
import { formatPhone } from "@/lib/phone";
import type { Appointment } from "@/lib/api";

export default function ContactProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { clinicId } = useAuth();

  const { data: patient, isLoading: patientLoading } = usePatient(clinicId ?? "", id);
  const { data: appointments = [], isLoading: apptLoading } = useAppointments(clinicId ?? "");
  const { data: conversations = [] } = useConversations(clinicId ?? "");
  const cancelMutation = useCancelAppointment(clinicId ?? "");
  const markResultMutation = useMarkResult(clinicId ?? "");

  const [selected, setSelected] = useState<Appointment | null>(null);

  const isLoading = patientLoading || apptLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-base text-zinc-400">Paciente no encontrado.</p>
      </div>
    );
  }

  const patientAppointments = appointments
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const patientConversations = conversations.filter((c) => c.patientId === patient.id);

  function handleCancel(apptId: string, reason?: string) {
    cancelMutation.mutate({ id: apptId, body: reason ? { reason } : undefined });
    setSelected(null);
  }

  function handleMarkResult(apptId: string, result: "COMPLETED" | "NO_SHOW") {
    markResultMutation.mutate({ id: apptId, body: { status: result } });
    setSelected(null);
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
        <h1 className="text-base font-semibold text-zinc-900">{patient.name}</h1>
      </header>

      <div className="flex flex-col divide-y divide-zinc-100">
        {/* Patient info */}
        <div className="px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl font-semibold text-emerald-700">
              {patient.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900">{patient.name}</p>
              <a
                href={`https://wa.me/${patient.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-base text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                {formatPhone(patient.phone)}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Conversations */}
        {patientConversations.length > 0 && (
          <div className="px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Conversaciones
            </p>
            <div className="flex flex-col gap-2">
              {patientConversations.map((conv) => {
                const last = conv.messages[conv.messages.length - 1];
                const preview = last?.text ?? "";
                const ago = last ? timeAgo(last.sentAt) : "";
                return (
                  <Link
                    key={conv.id}
                    href={`/conversations/${conv.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 hover:bg-zinc-50 hover:border-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageCircle className="h-4 w-4 shrink-0 text-zinc-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {preview.length > 40 ? preview.slice(0, 40) + "…" : preview}
                        </p>
                        <p className="text-sm text-zinc-400">{ago}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-400 shrink-0 ml-2">Ver →</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Appointment history */}
        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Historial de citas
          </p>

          {patientAppointments.length === 0 ? (
            <p className="text-base text-zinc-400">Este paciente no tiene citas registradas.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {patientAppointments.map((appt) => (
                <button
                  key={appt.id}
                  onClick={() => setSelected(appt)}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-left hover:bg-zinc-50 hover:border-zinc-200 active:bg-zinc-100 transition-colors"
                >
                  <div>
                    <p className="text-base font-medium text-zinc-900">{appt.service.name}</p>
                    <p className="text-sm text-zinc-400">
                      {localDate(appt.startsAt)} · {localTime(appt.startsAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[appt.status]}`} />
                    <span className="text-sm text-zinc-500">{STATUS_LABEL[appt.status]}</span>
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
        onCancel={handleCancel}
        onMarkResult={handleMarkResult}
      />
    </div>
  );
}
