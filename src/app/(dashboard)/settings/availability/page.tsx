"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DevPanel } from "@/components/dev-panel";
import { Loader2, CheckCircle2 } from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "error";
type PageState = "idle" | "saving" | "saved" | "error" | "time-error";

const DEV_STATES = [
  { label: "Editable",       value: "idle" as PageState },
  { label: "Error horario",  value: "time-error" as PageState },
  { label: "Guardando",      value: "saving" as PageState },
  { label: "Guardado",       value: "saved" as PageState },
  { label: "Error",          value: "error" as PageState },
];

type DaySchedule = {
  label: string;
  active: boolean;
  open: string;
  close: string;
};

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { label: "Lunes",     active: true,  open: "08:00", close: "17:00" },
  { label: "Martes",    active: true,  open: "08:00", close: "17:00" },
  { label: "Miércoles", active: true,  open: "08:00", close: "17:00" },
  { label: "Jueves",    active: true,  open: "08:00", close: "17:00" },
  { label: "Viernes",   active: true,  open: "08:00", close: "17:00" },
  { label: "Sábado",    active: false, open: "08:00", close: "17:00" },
  { label: "Domingo",   active: false, open: "08:00", close: "17:00" },
];

export default function SettingsAvailabilityPage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);

  const hasActiveDay = schedule.some((d) => d.active);

  function updateDay(index: number, changes: Partial<DaySchedule>) {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, ...changes } : d)));
  }

  function hasTimeError(day: DaySchedule) {
    return pageState === "time-error" && day.active && day.open >= day.close;
  }

  function handleSave() {
    const hasError = schedule.some((d) => d.active && d.open >= d.close);
    if (hasError) {
      setPageState("time-error");
      return;
    }
    setPageState("saving");
    setTimeout(() => setPageState("saved"), 1000);
  }

  const saveState: SaveState =
    pageState === "saving" ? "saving"
    : pageState === "saved" ? "saved"
    : pageState === "error" ? "error"
    : "idle";

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-1">
        {schedule.map((day, index) => (
          <div key={day.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-3 py-2.5">
              <Switch
                checked={day.active}
                onCheckedChange={(checked) => updateDay(index, { active: checked })}
              />
              <span className="w-24 text-sm text-zinc-700">{day.label}</span>
              {day.active ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => updateDay(index, { open: e.target.value })}
                    className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  <span className="text-xs text-zinc-400">–</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => updateDay(index, { close: e.target.value })}
                    className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
              ) : (
                <span className="text-xs text-zinc-400">Cerrado</span>
              )}
            </div>
            {hasTimeError(day) && (
              <p className="pl-10 text-xs text-red-500">
                La hora de cierre debe ser posterior a la de apertura.
              </p>
            )}
          </div>
        ))}
      </div>

      {!hasActiveDay && (
        <p className="text-center text-sm text-zinc-400">
          Activa al menos un día para guardar.
        </p>
      )}

      {saveState === "saved" && (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Horario actualizado.
        </div>
      )}

      {saveState === "error" && (
        <p className="text-sm text-red-500">
          No pudimos guardar los cambios. Intenta de nuevo.
        </p>
      )}

      <Button
        onClick={handleSave}
        disabled={!hasActiveDay || saveState === "saving"}
        className="w-full"
      >
        {saveState === "saving" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar cambios"
        )}
      </Button>

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
