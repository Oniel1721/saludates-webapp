"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { DevPanel } from "@/components/dev-panel";
import { Loader2 } from "lucide-react";

type PageState = "idle" | "saving" | "validation-error";

const DEV_STATES = [
  { label: "Vacío", value: "idle" as PageState },
  { label: "Error de validación", value: "validation-error" as PageState },
  { label: "Guardando", value: "saving" as PageState },
];

export default function OnboardingClinicPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("idle");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const hasData = name.trim().length > 0 && address.trim().length > 0;

  function handleContinue() {
    if (!hasData) {
      setState("validation-error");
      return;
    }
    setState("saving");
    setTimeout(() => router.push("/onboarding/whatsapp"), 1000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-sm flex-col gap-8">

        <OnboardingProgress step={1} total={4} />

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-900">Datos del consultorio</h1>
          <p className="text-sm text-zinc-500">Así se identificará tu consultorio con los pacientes.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre del consultorio</Label>
            <Input
              id="name"
              placeholder="Ej: Consultorio Dra. Martínez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {state === "validation-error" && !name.trim() && (
              <p className="text-xs text-red-500">Este campo es requerido.</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Ej: Calle El Sol #45, Santiago"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {state === "validation-error" && !address.trim() && (
              <p className="text-xs text-red-500">Este campo es requerido.</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={state === "saving"}
          className="w-full"
        >
          {state === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>

      </div>

      <DevPanel states={DEV_STATES} current={state} onSelect={setState} />
    </div>
  );
}
