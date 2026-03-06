"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { Appointment } from "@/lib/mock";

type CancelAppointmentModalProps = {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (id: number, reason?: string) => void;
};

export function CancelAppointmentModal({
  open,
  appointment,
  onClose,
  onConfirm,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  if (!appointment) return null;

  function handleConfirm() {
    setSaving(true);
    setError(false);
    setTimeout(() => {
      setSaving(false);
      onConfirm(appointment!.id, reason || undefined);
      setReason("");
      onClose();
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancelar cita</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm">
            <p className="font-medium text-zinc-900">{appointment.patientName}</p>
            <p className="text-zinc-500">{appointment.service}</p>
            <p className="text-zinc-500">{appointment.date} · {appointment.startTime}</p>
          </div>

          <Input
            placeholder="Motivo de la cancelación (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && (
            <p className="text-xs text-red-500">No se pudo cancelar la cita. Intenta de nuevo.</p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={saving}
              className="w-full"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar cancelación"}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Volver
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
