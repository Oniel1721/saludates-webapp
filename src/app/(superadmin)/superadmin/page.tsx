"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Wifi, WifiOff, Building2 } from "lucide-react";
import { DevPanel } from "@/components/dev-panel";
import { formatPhone } from "@/lib/phone";

type ClinicStatus = "active" | "trial" | "inactive";
type Plan = "basic" | "professional";

type Clinic = {
  id: number;
  name: string;
  doctor: string;
  phone: string;
  status: ClinicStatus;
  whatsappConnected: boolean;
  plan: Plan;
  createdAt: string;
  appointmentsThisMonth: number;
};

type PageState = "with-clinics" | "empty";

const DEV_STATES = [
  { label: "Con consultorios", value: "with-clinics" as PageState },
  { label: "Sin consultorios", value: "empty" as PageState },
];

const STATUS_LABEL: Record<ClinicStatus, string> = {
  active:   "Activo",
  trial:    "Prueba",
  inactive: "Inactivo",
};

const STATUS_COLORS: Record<ClinicStatus, string> = {
  active:   "bg-emerald-100 text-emerald-700",
  trial:    "bg-amber-100 text-amber-700",
  inactive: "bg-zinc-100 text-zinc-500",
};

const PLAN_LABEL: Record<Plan, string> = {
  basic:        "Básico",
  professional: "Profesional",
};

const MOCK_CLINICS: Clinic[] = [
  {
    id: 1,
    name: "Consultorio Dra. Martínez",
    doctor: "Dra. Laura Martínez",
    phone: "18091234567",
    status: "active",
    whatsappConnected: true,
    plan: "professional",
    createdAt: "2026-01-15",
    appointmentsThisMonth: 38,
  },
  {
    id: 2,
    name: "Centro Médico Dr. Pérez",
    doctor: "Dr. Roberto Pérez",
    phone: "18291234567",
    status: "active",
    whatsappConnected: true,
    plan: "basic",
    createdAt: "2026-02-01",
    appointmentsThisMonth: 21,
  },
  {
    id: 3,
    name: "Clínica Familiar Sánchez",
    doctor: "Dr. Miguel Sánchez",
    phone: "18491234567",
    status: "trial",
    whatsappConnected: false,
    plan: "professional",
    createdAt: "2026-03-01",
    appointmentsThisMonth: 5,
  },
  {
    id: 4,
    name: "Consultorio Dra. García",
    doctor: "Dra. Carmen García",
    phone: "18091234568",
    status: "inactive",
    whatsappConnected: false,
    plan: "basic",
    createdAt: "2025-11-10",
    appointmentsThisMonth: 0,
  },
];

export default function SuperadminListPage() {
  const [pageState, setPageState] = useState<PageState>("with-clinics");
  const [query, setQuery] = useState("");

  const clinics =
    pageState === "empty"
      ? []
      : MOCK_CLINICS.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.doctor.toLowerCase().includes(query.toLowerCase())
        );

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

      {/* Search */}
      {pageState !== "empty" && (
        <div className="border-b border-zinc-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar consultorio o doctor..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Stats bar */}
      {pageState !== "empty" && (
        <div className="flex divide-x divide-zinc-200 border-b border-zinc-200 bg-white">
          {[
            { label: "Total",    value: MOCK_CLINICS.length },
            { label: "Activos",  value: MOCK_CLINICS.filter((c) => c.status === "active").length },
            { label: "Prueba",   value: MOCK_CLINICS.filter((c) => c.status === "trial").length },
            { label: "Inactivos",value: MOCK_CLINICS.filter((c) => c.status === "inactive").length },
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
            {pageState === "empty" || query === ""
              ? "No hay consultorios registrados."
              : "No se encontraron resultados."}
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
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[clinic.status]}`}>
                      {STATUS_LABEL[clinic.status]}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{clinic.doctor}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs text-zinc-400">{formatPhone(clinic.phone)}</span>
                    <span className="text-xs text-zinc-300">·</span>
                    <span className="text-xs text-zinc-400">{PLAN_LABEL[clinic.plan]}</span>
                    <span className="text-xs text-zinc-300">·</span>
                    <span className="text-xs text-zinc-400">{clinic.appointmentsThisMonth} citas este mes</span>
                  </div>
                </div>

                {/* WhatsApp status */}
                <div className="shrink-0 pt-0.5">
                  {clinic.whatsappConnected ? (
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

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
