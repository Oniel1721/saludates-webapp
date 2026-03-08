"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-16">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-zinc-200 bg-white">
        <Link href="/agenda" className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <span>📅</span>
          <span>Agenda</span>
        </Link>
        <Link href="/conversations" className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <span>💬</span>
          <span>Conversaciones</span>
        </Link>
        <Link href="/contacts" className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <span>👤</span>
          <span>Contactos</span>
        </Link>
        <Link href="/settings/clinic" className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <span>⚙️</span>
          <span>Configuración</span>
        </Link>
      </nav>
    </div>
  );
}
