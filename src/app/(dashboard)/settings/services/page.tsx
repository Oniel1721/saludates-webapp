"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ServiceModal, type ServiceData } from "@/components/service-modal";
import { DevPanel } from "@/components/dev-panel";
import { MOCK_SERVICES } from "@/lib/mock";

type PageState = "with-services" | "empty";

const DEV_STATES = [
  { label: "Con servicios",  value: "with-services" as PageState },
  { label: "Sin servicios",  value: "empty" as PageState },
];

const INITIAL_SERVICES: ServiceData[] = MOCK_SERVICES.map((s) => ({
  id: s.id,
  name: s.name,
  price: s.price,
  duration: s.durationMinutes,
}));

export default function SettingsServicesPage() {
  const [pageState, setPageState] = useState<PageState>("with-services");
  const [services, setServices] = useState<ServiceData[]>(INITIAL_SERVICES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceData | undefined>();

  const displayServices = pageState === "empty" ? [] : services;

  function handleAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function handleEdit(s: ServiceData) {
    setEditing(s);
    setModalOpen(true);
  }

  function handleDelete(id: number) {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSave(data: ServiceData) {
    if (data.id) {
      setServices((prev) => prev.map((s) => (s.id === data.id ? data : s)));
    } else {
      setServices((prev) => [...prev, { ...data, id: Date.now() }]);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {displayServices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-10 text-center">
          <p className="text-sm text-zinc-400">No hay servicios configurados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayServices.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-zinc-900">{service.name}</p>
                <p className="text-xs text-zinc-400">
                  RD${service.price.toLocaleString()} · {service.duration} min
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(service)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id!)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleAdd}
        className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
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

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
