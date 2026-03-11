"use client";

import { useState } from "react";
import { Pencil, Archive, Plus, Loader2 } from "lucide-react";
import { ServiceModal, type ServiceData } from "@/components/service-modal";
import { useAuth } from "@/lib/auth-context";
import { useServices, useCreateService, useUpdateService, useArchiveService } from "@/lib/hooks/use-services";

export default function SettingsServicesPage() {
  const { clinicId } = useAuth();
  const { data: services = [], isLoading } = useServices(clinicId ?? "");
  const createService = useCreateService(clinicId ?? "");
  const updateService = useUpdateService(clinicId ?? "");
  const archiveService = useArchiveService(clinicId ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceData | undefined>();

  const activeServices = services.filter((s) => !s.archivedAt);

  function handleAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function handleEdit(s: ServiceData) {
    setEditing(s);
    setModalOpen(true);
  }

  function handleSave(data: ServiceData) {
    if (data.id) {
      updateService.mutate({
        id: data.id,
        body: { name: data.name, price: data.price, durationMinutes: data.duration, prerequisites: data.prerequisites },
      });
    } else {
      createService.mutate({
        name: data.name,
        price: data.price,
        durationMinutes: data.duration,
        prerequisites: data.prerequisites,
      });
    }
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : activeServices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-10 text-center">
          <p className="text-base text-zinc-400">No hay servicios configurados.</p>
          <p className="mt-1 text-sm text-zinc-300">Agrega un servicio para empezar.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activeServices.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3.5 hover:bg-zinc-50 hover:border-zinc-200 transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-base font-medium text-zinc-900">{service.name}</p>
                <p className="text-sm text-zinc-400">
                  RD${service.price.toLocaleString()} · {service.durationMinutes} min
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    handleEdit({
                      id: service.id,
                      name: service.name,
                      price: service.price,
                      duration: service.durationMinutes,
                      prerequisites: service.prerequisites ?? undefined,
                    })
                  }
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 active:bg-zinc-200 transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => archiveService.mutate(service.id)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors"
                  title="Archivar"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleAdd}
        className="flex items-center gap-2.5 rounded-xl border border-dashed border-zinc-200 px-4 py-3.5 text-base text-zinc-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100"
      >
        <Plus className="h-4 w-4" />
        Agregar servicio
      </button>

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
        showPriceWarning={true}
      />
    </div>
  );
}
