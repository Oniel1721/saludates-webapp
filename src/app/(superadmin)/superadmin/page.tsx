"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Wifi, WifiOff, Building2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Clinic } from "@/lib/api";

export default function SuperadminListPage() {
  const [query, setQuery] = useState("");

  const { data: allClinics = [], isLoading } = useQuery({
    queryKey: ["superadmin-clinics"],
    queryFn: () => api.clinics.list(),
  });

  const clinics = allClinics.filter(
    (c: Clinic) =>
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalActive = allClinics.filter((c) => c.whatsappStatus === "CONNECTED").length;
  const totalDisconnected = allClinics.filter((c) => c.whatsappStatus !== "CONNECTED").length;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">Consultorios</h1>
        <Link
          href="/superadmin/new"
          className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
        </div>
      ) : (
        <>
          {/* Search */}
          {allClinics.length > 0 && (
            <div className="border-b border-zinc-200 bg-white px-4 py-2">
              <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar consultorio..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Stats bar */}
          {allClinics.length > 0 && (
            <div className="flex divide-x divide-zinc-200 border-b border-zinc-200 bg-white">
              {[
                { label: "Total",        value: allClinics.length },
                { label: "Activos",      value: totalActive },
                { label: "Sin WhatsApp", value: totalDisconnected },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-1 flex-col items-center py-3">
                  <span className="text-base font-semibold text-zinc-900">{stat.value}</span>
                  <span className="text-[10px] text-zinc-400">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* List */}
          {clinics.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
              <Building2 className="h-12 w-12 text-zinc-200" />
              <p className="text-sm font-medium text-zinc-500">
                {query ? "No se encontraron resultados." : "No hay consultorios registrados."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {clinics.map((clinic) => (
                <li key={clinic.id} className="bg-white">
                  <div className="flex items-start gap-3 px-4 py-4">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                      {clinic.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-900">{clinic.name}</p>
                      </div>
                      {clinic.address && (
                        <p className="text-xs text-zinc-500">{clinic.address}</p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        {clinic.authorizedEmails.slice(0, 2).map((e) => (
                          <span key={e}>{e}</span>
                        ))}
                        {clinic.authorizedEmails.length > 2 && (
                          <span>+{clinic.authorizedEmails.length - 2} más</span>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp status */}
                    <div className="shrink-0 pt-0.5">
                      {clinic.whatsappStatus === "CONNECTED" ? (
                        <Wifi className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-zinc-300" />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
