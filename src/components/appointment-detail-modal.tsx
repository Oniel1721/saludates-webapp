"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CancelAppointmentModal } from "@/components/cancel-appointment-modal";
import { MarkResultModal } from "@/components/mark-result-modal";
import { ExternalLink } from "lucide-react";
import type { Appointment } from "@/lib/api";
import { STATUS_LABEL, STATUS_DOT, STATUS_COLORS } from "@/lib/constants";
import { localDate, localTime } from "@/lib/date-helpers";
import { formatPhone as fmtPhone } from "@/lib/phone";

type AppointmentDetailModalProps = {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onCancel: (id: string, reason?: string) => void;
  onMarkResult: (id: string, result: "COMPLETED" | "NO_SHOW") => void;
};

type SubModal = "cancel" | "mark-result" | null;

export function AppointmentDetailModal({
  open,
  appointment,
  onClose,
  onCancel,
  onMarkResult,
}: AppointmentDetailModalProps) {
  const [subModal, setSubModal] = useState<SubModal>(null);

  if (!appointment) return null;

  const now = new Date();
  const apptDate = new Date(appointment.startsAt);
  const isPast = apptDate < now;
  const isFuture = !isPast;

  const status = appointment.status;
  const dotColor = STATUS_DOT[status];
  const badgeColor = STATUS_COLORS[status];
  const label = STATUS_LABEL[status];

  function handleCancel(id: string, reason?: string) {
    onCancel(id, reason);
    setSubModal(null);
    onClose();
  }

  function handleMarkResult(id: string, result: "COMPLETED" | "NO_SHOW") {
    onMarkResult(id, result);
    setSubModal(null);
    onClose();
  }

  return (
    <>
      <Dialog open={open && subModal === null} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detalle de cita</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 pt-1">
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 ${badgeColor}`}>
              <span className={`h-2 w-2 rounded-full ${dotColor}`} />
              <span className="text-sm font-medium">{label}</span>
            </div>

            {/* Appointment data */}
            <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 px-4 py-3">
              <Row label="Paciente" value={<span className="font-medium text-zinc-900">{appointment.patient.name}</span>} />
              <Row
                label="WhatsApp"
                value={
                  <a
                    href={`https://wa.me/${appointment.patient.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-600 hover:underline"
                  >
                    {fmtPhone(appointment.patient.phone)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                }
              />
              <Row label="Servicio" value={appointment.service.name} />
              <Row
                label="Fecha"
                value={`${localDate(appointment.startsAt)} · ${localTime(appointment.startsAt)} – ${localTime(appointment.endsAt)}`}
              />
              <Row label="Precio" value={`RD$${appointment.price.toLocaleString()}`} />
              <Row
                label="Creada por"
                value={appointment.createdBy === "BOT" ? "Paciente (bot)" : "Secretaria"}
              />
              {status === "CANCELLED" && appointment.cancelReason && (
                <Row label="Razón" value={appointment.cancelReason} />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {isFuture && (status === "PENDING" || status === "CONFIRMED") && (
                <>
                  <Button variant="outline" className="w-full">Editar cita</Button>
                  <Button
                    variant="outline"
                    onClick={() => setSubModal("cancel")}
                    className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    Cancelar cita
                  </Button>
                </>
              )}

              {isPast && (status === "PENDING" || status === "CONFIRMED") && (
                <>
                  <Button onClick={() => setSubModal("mark-result")} className="w-full">
                    Marcar como Completada
                  </Button>
                  <Button variant="outline" onClick={() => setSubModal("mark-result")} className="w-full">
                    Marcar como No asistió
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSubModal("cancel")}
                    className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    Cancelar cita
                  </Button>
                </>
              )}

              {(status === "COMPLETED" || status === "NO_SHOW") && (
                <Button variant="outline" onClick={() => setSubModal("mark-result")} className="w-full">
                  {status === "COMPLETED" ? "Corregir a No asistió" : "Corregir a Completada"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CancelAppointmentModal
        open={subModal === "cancel"}
        appointment={appointment}
        onClose={() => setSubModal(null)}
        onConfirm={handleCancel}
      />
      <MarkResultModal
        open={subModal === "mark-result"}
        appointment={appointment}
        onClose={() => setSubModal(null)}
        onConfirm={handleMarkResult}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-sm text-zinc-400">{label}</span>
      <span className="text-right text-sm text-zinc-700">{value}</span>
    </div>
  );
}
