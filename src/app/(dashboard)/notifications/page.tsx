"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  UserX,
  Bell,
} from "lucide-react";
import { DevPanel } from "@/components/dev-panel";

type NotificationType =
  | "escalation"
  | "new-appointment"
  | "confirmed"
  | "cancelled"
  | "no-show";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  href?: string;
};

type PageState = "with-notifications" | "all-read" | "empty";

const DEV_STATES = [
  { label: "Con notificaciones", value: "with-notifications" as PageState },
  { label: "Todas leídas",       value: "all-read" as PageState },
  { label: "Sin notificaciones", value: "empty" as PageState },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "escalation",
    title: "Conversación escalada",
    description: "Juan Pérez necesita atención del personal.",
    timeAgo: "hace 5 min",
    read: false,
    href: "/conversations/1",
  },
  {
    id: 2,
    type: "new-appointment",
    title: "Nueva cita agendada",
    description: "Ana García agendó Consulta general para el 6 mar a las 14:00.",
    timeAgo: "hace 20 min",
    read: false,
    href: "/agenda",
  },
  {
    id: 3,
    type: "confirmed",
    title: "Cita confirmada",
    description: "María Rodríguez confirmó su cita del 6 mar a las 9:00.",
    timeAgo: "hace 2 horas",
    read: false,
    href: "/agenda",
  },
  {
    id: 4,
    type: "cancelled",
    title: "Cita cancelada",
    description: "Luis Sánchez canceló su cita de Espirometría del 3 mar.",
    timeAgo: "hace 1 día",
    read: true,
    href: "/agenda",
  },
  {
    id: 5,
    type: "no-show",
    title: "Paciente no asistió",
    description: "Carlos Martínez no se presentó a Espirometría del 2 mar.",
    timeAgo: "hace 4 días",
    read: true,
    href: "/contacts/3",
  },
];

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; iconClass: string; dotClass: string }
> = {
  escalation:       { icon: AlertTriangle, iconClass: "text-red-500",    dotClass: "bg-red-500" },
  "new-appointment":{ icon: CalendarPlus,  iconClass: "text-blue-500",   dotClass: "bg-blue-500" },
  confirmed:        { icon: CheckCircle2,  iconClass: "text-emerald-500", dotClass: "bg-emerald-500" },
  cancelled:        { icon: XCircle,       iconClass: "text-zinc-400",   dotClass: "bg-zinc-400" },
  "no-show":        { icon: UserX,         iconClass: "text-amber-500",  dotClass: "bg-amber-500" },
};

export default function NotificationsPage() {
  const [pageState, setPageState] = useState<PageState>("with-notifications");
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const displayed: Notification[] =
    pageState === "empty"
      ? []
      : pageState === "all-read"
      ? notifications.map((n) => ({ ...n, read: true }))
      : notifications;

  const unreadCount = displayed.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">Notificaciones</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
          >
            Marcar todas como leídas
          </button>
        )}
      </header>

      {/* Content */}
      {displayed.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Bell className="h-12 w-12 text-zinc-200" />
          <p className="text-sm font-medium text-zinc-500">No hay notificaciones.</p>
          <p className="text-xs text-zinc-400">
            Aquí verás alertas de citas, escalamientos y más.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {displayed.map((notif) => {
            const config = TYPE_CONFIG[notif.type];
            const Icon = config.icon;

            const content = (
              <div
                className={`flex items-start gap-3 px-4 py-4 transition-colors hover:bg-zinc-50 ${
                  notif.read ? "opacity-50" : ""
                }`}
                onClick={() => markRead(notif.id)}
              >
                {/* Icon */}
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <Icon className={`h-4 w-4 ${config.iconClass}`} />
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900">{notif.title}</p>
                    <span className="shrink-0 text-xs text-zinc-400">{notif.timeAgo}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{notif.description}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${config.dotClass}`} />
                )}
              </div>
            );

            return (
              <li key={notif.id}>
                {notif.href ? (
                  <Link href={notif.href} className="block">
                    {content}
                  </Link>
                ) : (
                  <div className="cursor-default">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
