"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, AlertTriangle } from "lucide-react";
import { DevPanel } from "@/components/dev-panel";
import { MOCK_CONVERSATIONS, FLOW_LABEL, type Conversation } from "@/lib/mock";

type PageState = "with-escalations" | "without-escalations" | "empty";

const DEV_STATES = [
  { label: "Con escalamientos",   value: "with-escalations" as PageState },
  { label: "Sin escalamientos",   value: "without-escalations" as PageState },
  { label: "Sin conversaciones",  value: "empty" as PageState },
];

function getConversations(state: PageState): Conversation[] {
  if (state === "empty") return [];
  if (state === "without-escalations")
    return MOCK_CONVERSATIONS.map((c) => ({ ...c, isEscalated: false }));
  return MOCK_CONVERSATIONS;
}

export default function ConversationsPage() {
  const [pageState, setPageState] = useState<PageState>("with-escalations");

  const conversations = getConversations(pageState).sort((a, b) => {
    // Escalated always first
    if (a.isEscalated && !b.isEscalated) return -1;
    if (!a.isEscalated && b.isEscalated) return 1;
    return 0;
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">Conversaciones</h1>
        <Link href="/notifications" className="relative">
          <Bell className="h-5 w-5 text-zinc-500" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </Link>
      </header>

      {/* Content */}
      {conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <MessageCircle className="h-12 w-12 text-zinc-200" />
          <p className="text-sm font-medium text-zinc-500">No hay conversaciones activas.</p>
          <p className="text-xs text-zinc-400">
            Aquí aparecerán las conversaciones del bot con los pacientes.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link
                href={`/conversations/${conv.id}`}
                className="flex items-start gap-3 px-4 py-4 hover:bg-zinc-50 active:bg-zinc-100"
              >
                {/* Avatar / escalation indicator */}
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  conv.isEscalated
                    ? "bg-red-100 text-red-600"
                    : "bg-zinc-100 text-zinc-600"
                }`}>
                  {conv.isEscalated
                    ? <AlertTriangle className="h-4 w-4" />
                    : conv.patientName.charAt(0)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${conv.isEscalated ? "text-red-600" : "text-zinc-900"}`}>
                      {conv.patientName}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-400">{conv.lastMessageAgo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {conv.isEscalated && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                        Escalada
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">{FLOW_LABEL[conv.flow]}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {conv.lastMessagePreview}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
