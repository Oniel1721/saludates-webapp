"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { ServiceModal, type ServiceData } from "@/components/service-modal";
import { Pencil, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useServices, useCreateService, useUpdateService } from "@/lib/hooks/use-services";

export default function OnboardingServicesPage() {
  const router = useRouter();
  const { clinicId } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | undefined>();
  const [saving, setSaving] = useState(false);

  const { data: services = [], isLoading } = useServices(clinicId ?? "");
  const createService = useCreateService(clinicId ?? "");
  const updateService = useUpdateService(clinicId ?? "");

  function handleAdd() {
    setEditingService(undefined);
    setModalOpen(true);
  }

  function handleEdit(service: ServiceData) {
    setEditingService(service);
    setModalOpen(true);
  }

  async function handleSave(data: ServiceData) {
    setSaving(true);
    try {
      if (data.id) {
        await updateService.mutateAsync({
          id: data.id,
          body: { name: data.name, price: data.price, durationMinutes: data.duration },
        });
      } else {
        await createService.mutateAsync({
          name: data.name,
          price: data.price,
          durationMinutes: data.duration,
        });
      }
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  const displayServices: ServiceData[] = services
    .filter((s) => !s.archivedAt)
    .map((s) => ({ id: s.id, name: s.name, price: s.price, duration: s.durationMinutes }));

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
                <button
                  onClick={() => handleEdit(service)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ))
          )}

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Agregar servicio
          </button>
        </div>

        <Button
          onClick={() => router.push("/onboarding/schedule")}
          disabled={displayServices.length === 0}
          className="w-full"
        >
          Continuar
        </Button>

      </div>

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingService}
        showPriceWarning={false}
      />

    </div>
  );
}
