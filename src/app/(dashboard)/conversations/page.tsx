"use client";

import Link from "next/link";
import { Bell, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useConversations } from "@/lib/hooks/use-conversations";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { FLOW_LABEL } from "@/lib/constants";
import { timeAgo } from "@/lib/date-helpers";
import type { Conversation } from "@/lib/api";

function getLastMessage(conv: Conversation) {
  if (!conv.messages.length) return { preview: "", ago: "" };
  const last = conv.messages[conv.messages.length - 1];
  return {
    preview: last.text ?? "",
    ago: timeAgo(last.sentAt),
  };
}

export default function ConversationsPage() {
  const { clinicId } = useAuth();
  const { data: conversations = [], isLoading } = useConversations(clinicId ?? "");
  const { data: notifications = [] } = useNotifications(clinicId ?? "", true);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const sorted = [...conversations].sort((a, b) => {
    const aEsc = a.flow === "ESCALATED";
    const bEsc = b.flow === "ESCALATED";
    if (aEsc && !bEsc) return -1;
    if (!aEsc && bEsc) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">Conversaciones</h1>
        <Link
          href="/notifications"
          className="relative rounded-lg p-1.5 hover:bg-zinc-100 transition-colors"
        >
          <Bell className="h-5 w-5 text-zinc-500" />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <MessageCircle className="h-14 w-14 text-zinc-200" />
          <p className="text-base font-medium text-zinc-500">No hay conversaciones activas.</p>
          <p className="text-sm text-zinc-400">
            Aquí aparecerán las conversaciones del bot con los pacientes.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {sorted.map((conv) => {
            const isEscalated = conv.flow === "ESCALATED";
            const { preview, ago } = getLastMessage(conv);
            return (
              <li key={conv.id}>
                <Link
                  href={`/conversations/${conv.id}`}
                  className="flex items-start gap-3 px-4 py-4 hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                >
                  {/* Avatar / escalation indicator */}
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    isEscalated
                      ? "bg-red-100 text-red-600"
                      : "bg-zinc-100 text-zinc-600"
                  }`}>
                    {isEscalated
                      ? <AlertTriangle className="h-4 w-4" />
                      : conv.patient.name.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-base font-semibold ${isEscalated ? "text-red-600" : "text-zinc-900"}`}>
                        {conv.patient.name}
                      </span>
                      <span className="shrink-0 text-sm text-zinc-400">{ago}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
                      {isEscalated && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                          Escalada
                        </span>
                      )}
                      <span className="truncate text-sm text-zinc-400">{FLOW_LABEL[conv.flow]}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-zinc-400 max-w-[calc(100dvw-100px)]">{preview}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
