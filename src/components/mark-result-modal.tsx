"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Appointment, AppointmentStatus } from "@/lib/mock";

type MarkResultModalProps = {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (id: number, result: "completed" | "no-show") => void;
};

export function MarkResultModal({
  open,
  appointment,
  onClose,
  onConfirm,
}: MarkResultModalProps) {
  const [saving, setSaving] = useState<AppointmentStatus | null>(null);

  if (!appointment) return null;

  const isCorrection =
    appointment.status === "completed" || appointment.status === "no-show";

  function handle(result: "completed" | "no-show") {
    setSaving(result);
    setTimeout(() => {
      setSaving(null);
      onConfirm(appointment!.id, result);
      onClose();
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isCorrection ? "Corregir resultado" : "Marcar resultado"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm">
            <p className="font-medium text-zinc-900">{appointment.patientName}</p>
            <p className="text-zinc-500">{appointment.service}</p>
            <p className="text-zinc-500">{appointment.date} · {appointment.startTime}</p>
          </div>

          <p className="text-sm text-zinc-600">
            {isCorrection
              ? "¿Deseas corregir el resultado de esta cita?"
              : "¿El paciente asistió a su cita?"}
          </p>

          <div className="flex flex-col gap-2">
            {appointment.status !== "completed" && (
              <Button
                onClick={() => handle("completed")}
                disabled={saving !== null}
                className="w-full"
              >
                {saving === "completed" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCorrection ? (
                  "Marcar como Completada"
                ) : (
                  "Sí, asistió"
                )}
              </Button>
            )}
            {appointment.status !== "no-show" && (
              <Button
                variant="outline"
                onClick={() => handle("no-show")}
                disabled={saving !== null}
                className="w-full"
              >
                {saving === "no-show" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCorrection ? (
                  "Marcar como No asistió"
                ) : (
                  "No asistió"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
