"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Appointment } from "@/lib/api";
import { localDate, localTime } from "@/lib/date-helpers";

type MarkResultModalProps = {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (id: string, result: "COMPLETED" | "NO_SHOW") => void;
};

export function MarkResultModal({
  open,
  appointment,
  onClose,
  onConfirm,
}: MarkResultModalProps) {
  const [saving, setSaving] = useState<"COMPLETED" | "NO_SHOW" | null>(null);

  if (!appointment) return null;

  const isCorrection =
    appointment.status === "COMPLETED" || appointment.status === "NO_SHOW";

  function handle(result: "COMPLETED" | "NO_SHOW") {
    setSaving(result);
    onConfirm(appointment!.id, result);
    setSaving(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isCorrection ? "Corregir resultado" : "Marcar resultado"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm">
            <p className="font-medium text-zinc-900">{appointment.patient.name}</p>
            <p className="text-zinc-500">{appointment.service.name}</p>
            <p className="text-zinc-500">
              {localDate(appointment.startsAt)} · {localTime(appointment.startsAt)}
            </p>
          </div>

          <p className="text-sm text-zinc-600">
            {isCorrection
              ? "¿Deseas corregir el resultado de esta cita?"
              : "¿El paciente asistió a su cita?"}
          </p>

          <div className="flex flex-col gap-2">
            {appointment.status !== "COMPLETED" && (
              <Button
                onClick={() => handle("COMPLETED")}
                disabled={saving !== null}
                className="w-full"
              >
                {saving === "COMPLETED" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCorrection ? (
                  "Marcar como Completada"
                ) : (
                  "Sí, asistió"
                )}
              </Button>
            )}
            {appointment.status !== "NO_SHOW" && (
              <Button
                variant="outline"
                onClick={() => handle("NO_SHOW")}
                disabled={saving !== null}
                className="w-full"
              >
                {saving === "NO_SHOW" ? (
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
