"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { DevPanel } from "@/components/dev-panel";
import {
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  type Patient,
} from "@/lib/mock";
import { formatPhone } from "@/lib/phone";

type PageState = "with-contacts" | "empty";

const DEV_STATES = [
  { label: "Con contactos", value: "with-contacts" as PageState },
  { label: "Sin contactos", value: "empty" as PageState },
];

function getLastAppointment(patient: Patient) {
  const appts = MOCK_APPOINTMENTS.filter(
    (a) => a.patientPhone === patient.phone
  ).sort((a, b) => (a.date < b.date ? 1 : -1));
  return appts[0] ?? null;
}

export default function ContactsPage() {
  const [pageState, setPageState] = useState<PageState>("with-contacts");
  const [query, setQuery] = useState("");

  const patients =
    pageState === "empty"
      ? []
      : MOCK_PATIENTS.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.phone.includes(query)
        ).sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 px-4 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">Contactos</h1>
      </header>

      {/* Search */}
      {pageState !== "empty" && (
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
      )}

      {/* Content */}
      {patients.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Users className="h-12 w-12 text-zinc-200" />
          <p className="text-sm font-medium text-zinc-500">
            {pageState === "empty" || query === ""
              ? "No hay contactos registrados."
              : "No se encontraron pacientes."}
          </p>
          {pageState !== "empty" && query === "" && (
            <p className="text-xs text-zinc-400">
              Los pacientes aparecerán aquí cuando agenden citas.
            </p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {patients.map((patient) => {
            const last = getLastAppointment(patient);
            return (
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
                    <p className="text-sm font-medium text-zinc-900">
                      {patient.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatPhone(patient.phone)}
                    </p>
                  </div>

                  {/* Last appointment */}
                  {last && (
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-zinc-400">{last.date}</p>
                      <p className="text-xs text-zinc-400">{last.service}</p>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
