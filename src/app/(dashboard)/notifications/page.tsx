"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  UserX,
  Bell,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/hooks/use-notifications";
import { timeAgo } from "@/lib/date-helpers";
import type { NotificationType } from "@/lib/api";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; iconClass: string; bgClass: string; dotClass: string; href?: string }
> = {
  ESCALATION:                { icon: AlertTriangle, iconClass: "text-red-500",     bgClass: "bg-red-50",     dotClass: "bg-red-500" },
  ESCALATION_SECRETARY_REPLY:{ icon: AlertTriangle, iconClass: "text-orange-500",  bgClass: "bg-orange-50",  dotClass: "bg-orange-500" },
  UNCONFIRMED_2H:            { icon: CalendarPlus,  iconClass: "text-blue-500",    bgClass: "bg-blue-50",    dotClass: "bg-blue-500" },
  RESULT_NEEDED:             { icon: CheckCircle2,  iconClass: "text-emerald-500", bgClass: "bg-emerald-50", dotClass: "bg-emerald-500" },
};

const DEFAULT_CONFIG = { icon: Bell, iconClass: "text-zinc-400", bgClass: "bg-zinc-100", dotClass: "bg-zinc-400" };

function hrefFor(notif: { type: NotificationType; conversationId: string | null; appointmentId: string | null }) {
  if (notif.conversationId) return `/conversations/${notif.conversationId}`;
  if (notif.appointmentId) return `/agenda`;
  return undefined;
}

export default function NotificationsPage() {
  const { clinicId } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications(clinicId ?? "");
  const markRead = useMarkNotificationRead(clinicId ?? "");
  const markAllRead = useMarkAllNotificationsRead(clinicId ?? "");

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">Notificaciones</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Bell className="h-14 w-14 text-zinc-200" />
          <p className="text-base font-medium text-zinc-500">No hay notificaciones.</p>
          <p className="text-sm text-zinc-400">
            Aquí verás alertas de citas, escalamientos y más.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG;
            const Icon = config.icon;
            const isRead = !!notif.readAt;
            const href = hrefFor(notif);

            const content = (
              <div
                className={`flex items-start gap-3 px-4 py-4 transition-colors hover:bg-zinc-50 ${isRead ? "opacity-60" : ""}`}
                onClick={() => !isRead && markRead.mutate(notif.id)}
              >
                {/* Icon */}
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}>
                  <Icon className={`h-5 w-5 ${config.iconClass}`} />
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-base font-semibold text-zinc-900 ${!isRead ? "" : "font-medium"}`}>
                      {notif.title}
                    </p>
                    <span className="shrink-0 text-sm text-zinc-400">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">{notif.body}</p>
                </div>

                {/* Unread dot */}
                {!isRead && (
                  <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${config.dotClass}`} />
                )}
              </div>
            );

            return (
              <li key={notif.id}>
                {href ? (
                  <Link href={href} className="block">{content}</Link>
                ) : (
                  <div className="cursor-default">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
