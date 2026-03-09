"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type DaySchedule = {
  label: string;
  dayOfWeek: number; // 0=Dom … 6=Sab
  active: boolean;
  open: string;
  close: string;
};

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { label: "Lunes",     dayOfWeek: 1, active: true,  open: "08:00", close: "17:00" },
  { label: "Martes",    dayOfWeek: 2, active: true,  open: "08:00", close: "17:00" },
  { label: "Miércoles", dayOfWeek: 3, active: true,  open: "08:00", close: "17:00" },
  { label: "Jueves",    dayOfWeek: 4, active: true,  open: "08:00", close: "17:00" },
  { label: "Viernes",   dayOfWeek: 5, active: true,  open: "08:00", close: "17:00" },
  { label: "Sábado",    dayOfWeek: 6, active: false, open: "08:00", close: "17:00" },
  { label: "Domingo",   dayOfWeek: 0, active: false, open: "08:00", close: "17:00" },
];

export default function OnboardingSchedulePage() {
  const router = useRouter();
  const { clinicId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [errorMsg, setErrorMsg] = useState("");

  const hasActiveDay = schedule.some((d) => d.active);

  function updateDay(index: number, changes: Partial<DaySchedule>) {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, ...changes } : d)));
  }

  function hasTimeErrorForDay(day: DaySchedule) {
    return timeError && day.active && day.open >= day.close;
  }

  async function handleFinish() {
    const hasErr = schedule.some((d) => d.active && d.open >= d.close);
    if (hasErr) {
      setTimeError(true);
      return;
    }
    if (!clinicId) return;
    setSaving(true);
    setErrorMsg("");
    try {
      await api.availability.upsertSchedule(clinicId, {
        schedule: schedule.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          isActive: d.active,
          startTime: d.open,
          endTime: d.close,
        })),
      });
      router.push("/agenda");
    } catch {
      setErrorMsg("No pudimos guardar el horario. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">

        <OnboardingProgress step={4} total={4} />

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-900">Configura tu horario</h1>
          <p className="text-sm text-zinc-500">
            ¿Cuándo atiende tu consultorio? El bot solo agendará citas en estos horarios.
          </p>
        </div>

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
              {hasTimeErrorForDay(day) && (
                <p className="pl-10 text-xs text-red-500">
                  La hora de cierre debe ser posterior a la de apertura.
                </p>
              )}
            </div>
          ))}
        </div>

        {!hasActiveDay && (
          <p className="text-center text-sm text-zinc-400">Activa al menos un día para continuar.</p>
        )}

        {errorMsg && <p className="text-center text-sm text-red-500">{errorMsg}</p>}

        <Button
          onClick={handleFinish}
          disabled={!hasActiveDay || saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Configurando...
            </>
          ) : (
            "Finalizar"
          )}
        </Button>

      </div>

    </div>
  );
}
