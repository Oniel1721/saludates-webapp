"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Clínica",         href: "/settings/clinic" },
  { label: "Servicios",       href: "/settings/services" },
  { label: "Disponibilidad",  href: "/settings/availability" },
  { label: "WhatsApp",        href: "/settings/whatsapp" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 px-4 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">Configuración</h1>
      </header>

      {/* Tabs */}
      <nav className="flex overflow-x-auto border-b border-zinc-100">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
