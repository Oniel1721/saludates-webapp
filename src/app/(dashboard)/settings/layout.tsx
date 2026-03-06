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
      <header className="border-b border-zinc-100 px-4 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">Configuración</h1>
      </header>

      {/* Tabs */}
      <nav className="flex overflow-x-auto border-b border-zinc-100">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${
                active
                  ? "border-zinc-900 font-medium text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
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
