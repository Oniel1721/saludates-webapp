"use server";

import Link from "next/link";
import { cookies } from "next/headers";
import { getServerClinicId, getServerPayload } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { SetupBanner } from "@/components/setup-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const payload = getServerPayload(cookieStore);
  const serverClinicId = getServerClinicId(cookieStore);

  if (!payload) {
    return redirect("/");
  }

  if (payload.role === "CLINIC_USER" && !payload?.clinicId) {
    return redirect("/");
  }

  if (payload.role === "SUPERADMIN" && !serverClinicId) {
    return redirect("/superadmin");
  }

  const clinicId =
    payload.role === "SUPERADMIN" ? serverClinicId : payload.clinicId;

  if (!clinicId) {
    return redirect("/");
  }

  const clinic = await api.clinics.get(clinicId, {
    server: { cookies: cookieStore },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SetupBanner clinicId={clinicId} whatsappStatus={clinic.whatsappStatus} />
      <main className="flex-1 pb-16">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-zinc-200 bg-white">
        <Link
          href="/agenda"
          className="flex flex-col items-center gap-1 text-xs text-zinc-500"
        >
          <span>📅</span>
          <span>Agenda</span>
        </Link>
        <Link
          href="/conversations"
          className="flex flex-col items-center gap-1 text-xs text-zinc-500"
        >
          <span>💬</span>
          <span>Conversaciones</span>
        </Link>
        <Link
          href="/contacts"
          className="flex flex-col items-center gap-1 text-xs text-zinc-500"
        >
          <span>👤</span>
          <span>Contactos</span>
        </Link>
        <Link
          href="/settings/clinic"
          className="flex flex-col items-center gap-1 text-xs text-zinc-500"
        >
          <span>⚙️</span>
          <span>Configuración</span>
        </Link>
      </nav>
    </div>
  );
}
