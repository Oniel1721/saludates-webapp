"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, MessageCircle, Users, Settings2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/agenda",          label: "Agenda",         icon: Calendar,       match: "/agenda" },
  { href: "/conversations",   label: "Conversaciones", icon: MessageCircle,  match: "/conversations" },
  { href: "/contacts",        label: "Contactos",      icon: Users,          match: "/contacts" },
  { href: "/settings/clinic", label: "Ajustes",        icon: Settings2,      match: "/settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch justify-around border-t border-zinc-200 bg-white md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = pathname.startsWith(match);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
              active ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600 active:text-zinc-700"
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-emerald-500" />
            )}
            <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
            <span className={`text-[11px] font-medium leading-none ${active ? "text-emerald-600" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
