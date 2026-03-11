"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, MessageCircle, Users, Settings2, Stethoscope } from "lucide-react";

const NAV_ITEMS = [
  { href: "/agenda",          label: "Agenda",         icon: Calendar,       match: "/agenda" },
  { href: "/conversations",   label: "Conversaciones", icon: MessageCircle,  match: "/conversations" },
  { href: "/contacts",        label: "Contactos",      icon: Users,          match: "/contacts" },
  { href: "/settings/clinic", label: "Configuración",  icon: Settings2,      match: "/settings" },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-zinc-200 bg-white md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
          <Stethoscope className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-zinc-900">Saludates</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = pathname.startsWith(match);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${active ? "text-emerald-600" : "text-zinc-400"}`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-5 py-4">
        <p className="text-xs text-zinc-400">Tu secretaria digital</p>
      </div>
    </aside>
  );
}
