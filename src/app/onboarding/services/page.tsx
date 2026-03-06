"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { DevPanel } from "@/components/dev-panel";
import { Pencil, Plus } from "lucide-react";

type PageState = "empty" | "with-services";

const DEV_STATES = [
  { label: "Sin servicios", value: "empty" as PageState },
  { label: "Con servicios", value: "with-services" as PageState },
];

type Service = {
  id: number;
  name: string;
  price: number;
  duration: number;
};

const MOCK_SERVICES: Service[] = [
  { id: 1, name: "Consulta general", price: 1500, duration: 30 },
  { id: 2, name: "Consulta de seguimiento", price: 1000, duration: 20 },
];

export default function OnboardingServicesPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("with-services");
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);

  const displayServices = state === "empty" ? [] : services;

  function handleContinue() {
    router.push("/onboarding/schedule");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-sm flex-col gap-8">

        <OnboardingProgress step={3} total={4} />

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-900">Agrega tus servicios</h1>
          <p className="text-sm text-zinc-500">El bot los mostrará a los pacientes al agendar una cita.</p>
        </div>

        <div className="flex flex-col gap-3">
          {displayServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center">
              <p className="text-sm text-zinc-400">Agrega al menos un servicio para continuar.</p>
            </div>
          ) : (
            displayServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-zinc-900">{service.name}</p>
                  <p className="text-xs text-zinc-400">
                    RD${service.price.toLocaleString()} · {service.duration} min
                  </p>
                </div>
                <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ))
          )}

          <button
            onClick={() => setServices((prev) => [...prev, { id: Date.now(), name: "Nuevo servicio", price: 800, duration: 30 }])}
            className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Agregar servicio
          </button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={displayServices.length === 0}
          className="w-full"
        >
          Continuar
        </Button>

      </div>

      <DevPanel states={DEV_STATES} current={state} onSelect={setState} />
    </div>
  );
}
