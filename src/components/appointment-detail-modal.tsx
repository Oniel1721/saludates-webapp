"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CancelAppointmentModal } from "@/components/cancel-appointment-modal";
import { MarkResultModal } from "@/components/mark-result-modal";
import { Loader2, ExternalLink } from "lucide-react";
import {
  type Appointment,
  type AppointmentStatus,
  STATUS_LABEL,
  STATUS_DOT,
} from "@/lib/mock";
import { formatPhone as fmtPhone } from "@/lib/phone";

type AppointmentDetailModalProps = {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onUpdate: (id: number, changes: Partial<Appointment>) => void;
};

type SubModal = "cancel" | "mark-result" | null;

export function AppointmentDetailModal({
  open,
  appointment,
  onClose,
  onUpdate,
}: AppointmentDetailModalProps) {
  const [subModal, setSubModal] = useState<SubModal>(null);
  const [loading] = useState(false);

  if (!appointment) return null;

  const now = new Date();
  const apptDate = new Date(`${appointment.date}T${appointment.startTime}`);
  const isPast = apptDate < now;

  const status = appointment.status;
  const isFuture = !isPast;

  function handleCancel(id: number, reason?: string) {
    onUpdate(id, {
      status: "cancelled",
      cancelReason: reason,
      cancelledAt: new Date().toISOString(),
    });
  }

  function handleMarkResult(id: number, result: "completed" | "no-show") {
    onUpdate(id, { status: result });
  }

  const dotColor = STATUS_DOT[status];
  const label = STATUS_LABEL[status];

  return (
    <>
      <Dialog open={open && subModal === null} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detalle de cita</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="flex flex-col gap-5 pt-1">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                <span className="text-sm font-medium text-zinc-700">{label}</span>
              </div>

              {/* Appointment data */}
              <div className="flex flex-col gap-2 text-sm">
                <Row label="Paciente" value={appointment.patientName} />
                <Row
                  label="WhatsApp"
                  value={
                    <a
                      href={`https://wa.me/${appointment.patientPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:underline"
                    >
                      {fmtPhone(appointment.patientPhone)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  }
                />
                <Row label="Servicio" value={appointment.service} />
                <Row label="Fecha" value={`${appointment.date} · ${appointment.startTime} – ${appointment.endTime}`} />
                <Row label="Precio" value={`RD$${appointment.price.toLocaleString()}`} />
                <Row label="Creada por" value={appointment.createdBy === "bot" ? "Paciente (bot)" : "Secretaria"} />
                {status === "cancelled" && appointment.cancelReason && (
                  <Row label="Razón" value={appointment.cancelReason} />
                )}
              </div>

              {/* Info text for terminal states */}
              {status === "completed" && (
                <p className="text-xs text-blue-600">Esta cita fue completada.</p>
              )}
              {status === "no-show" && (
                <p className="text-xs text-red-500">El paciente no se presentó.</p>
              )}
              {status === "cancelled" && (
                <p className="text-xs text-zinc-400">Cita cancelada.</p>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {/* Future pending/confirmed */}
                {isFuture && (status === "pending" || status === "confirmed") && (
                  <>
                    <Button variant="outline" className="w-full">Editar cita</Button>
                    <Button variant="outline" onClick={() => setSubModal("cancel")} className="w-full text-red-500 hover:text-red-600">
                      Cancelar cita
                    </Button>
                  </>
                )}

                {/* Past pending/confirmed */}
                {isPast && (status === "pending" || status === "confirmed") && (
                  <>
                    <Button onClick={() => setSubModal("mark-result")} className="w-full">
                      Marcar como Completada
                    </Button>
                    <Button variant="outline" onClick={() => setSubModal("mark-result")} className="w-full">
                      Marcar como No asistió
                    </Button>
                    <Button variant="outline" onClick={() => setSubModal("cancel")} className="w-full text-red-500 hover:text-red-600">
                      Cancelar cita
                    </Button>
                  </>
                )}

                {/* Correction */}
                {(status === "completed" || status === "no-show") && (
                  <Button variant="outline" onClick={() => setSubModal("mark-result")} className="w-full">
                    {status === "completed" ? "Corregir a No asistió" : "Corregir a Completada"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CancelAppointmentModal
        open={subModal === "cancel"}
        appointment={appointment}
        onClose={() => setSubModal(null)}
        onConfirm={(id, reason) => { handleCancel(id, reason); setSubModal(null); onClose(); }}
      />

      <MarkResultModal
        open={subModal === "mark-result"}
        appointment={appointment}
        onClose={() => setSubModal(null)}
        onConfirm={(id, result) => { handleMarkResult(id, result); setSubModal(null); onClose(); }}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-zinc-400">{label}</span>
      <span className="text-right text-zinc-800">{value}</span>
    </div>
  );
}
