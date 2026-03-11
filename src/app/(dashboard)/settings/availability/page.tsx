"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSchedule, useUpsertSchedule } from "@/lib/hooks/use-availability";

type DaySchedule = {
  dayOfWeek: number;
  label: string;
  active: boolean;
  open: string;
  close: string;
};

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const DEFAULT_SCHEDULE: DaySchedule[] = DAY_LABELS.map((label, i) => ({
  dayOfWeek: i,
  label,
  active: i >= 1 && i <= 5,
  open: "08:00",
  close: "17:00",
}));

export default function SettingsAvailabilityPage() {
  const { clinicId } = useAuth();
  const { data: schedules = [], isLoading } = useSchedule(clinicId ?? "");
  const upsertSchedule = useUpsertSchedule(clinicId ?? "");

  const [days, setDays] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [timeError, setTimeError] = useState(false);

  useEffect(() => {
    if (schedules.length > 0) {
      setDays(
        DAY_LABELS.map((label, i) => {
          const s = schedules.find((sc) => sc.dayOfWeek === i);
          return {
            dayOfWeek: i,
            label,
            active: s ? s.isActive : i >= 1 && i <= 5,
            open: s ? s.startTime : "08:00",
            close: s ? s.endTime : "17:00",
          };
        })
      );
    }
  }, [schedules]);

  const hasActiveDay = days.some((d) => d.active);

  function updateDay(index: number, changes: Partial<DaySchedule>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...changes } : d)));
    setTimeError(false);
  }

  function handleSave() {
    const hasError = days.some((d) => d.active && d.open >= d.close);
    if (hasError) {
      setTimeError(true);
      return;
    }
    setTimeError(false);
    upsertSchedule.mutate({
      schedule: days.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        isActive: d.active,
        startTime: d.open,
        endTime: d.close,
      })),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-1">
        {days.map((day, index) => (
          <div key={day.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-3 py-3">
              <Switch
                checked={day.active}
                onCheckedChange={(checked) => updateDay(index, { active: checked })}
              />
              <span className={`w-24 text-base ${day.active ? "text-zinc-900 font-medium" : "text-zinc-400"}`}>
                {day.label}
              </span>
              {day.active ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => updateDay(index, { open: e.target.value })}
                    className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
                  />
                  <span className="text-sm text-zinc-400">–</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => updateDay(index, { close: e.target.value })}
                    className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
                  />
                </div>
              ) : (
                <span className="text-sm text-zinc-400">Cerrado</span>
              )}
            </div>
            {timeError && day.active && day.open >= day.close && (
              <p className="pl-11 text-sm text-red-500">
                La hora de cierre debe ser posterior a la de apertura.
              </p>
            )}
          </div>
        ))}
      </div>

      {!hasActiveDay && (
        <p className="text-center text-base text-zinc-400">
          Activa al menos un día para guardar.
        </p>
      )}

      {upsertSchedule.isSuccess && (
        <div className="flex items-center gap-2 text-base text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Horario actualizado.
        </div>
      )}

      {upsertSchedule.isError && (
        <p className="text-base text-red-500">
          No pudimos guardar los cambios. Intenta de nuevo.
        </p>
      )}

      <Button
        onClick={handleSave}
        disabled={!hasActiveDay || upsertSchedule.isPending}
        className="w-full"
      >
        {upsertSchedule.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar cambios"
        )}
      </Button>
    </div>
  );
}
