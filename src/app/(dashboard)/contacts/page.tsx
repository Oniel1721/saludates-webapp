"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePatients } from "@/lib/hooks/use-patients";
import { formatPhone } from "@/lib/phone";

export default function ContactsPage() {
  const { clinicId } = useAuth();
  const [query, setQuery] = useState("");
  const { data: patients = [], isLoading } = usePatients(clinicId ?? "", query || undefined);

  const sorted = [...patients].sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 px-4 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">Contactos</h1>
      </header>

      {/* Search */}
      <div className="border-b border-zinc-100 px-4 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Users className="h-12 w-12 text-zinc-200" />
          <p className="text-sm font-medium text-zinc-500">
            {query ? "No se encontraron pacientes." : "No hay contactos registrados."}
          </p>
          {!query && (
            <p className="text-xs text-zinc-400">
              Los pacientes aparecerán aquí cuando agenden citas.
            </p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {sorted.map((patient) => (
            <li key={patient.id}>
              <Link
                href={`/contacts/${patient.id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-zinc-50 active:bg-zinc-100"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                  {patient.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">{patient.name}</p>
                  <p className="text-xs text-zinc-400">{formatPhone(patient.phone)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
