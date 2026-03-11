"use server";

import { cookies } from "next/headers";
import { getServerClinicId, getServerPayload } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { SetupBanner } from "@/components/setup-banner";
import { BottomNav } from "@/components/bottom-nav";
import { SidebarNav } from "@/components/sidebar-nav";

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
    <div className="flex min-h-screen bg-white">
      <SidebarNav />
      <div className="flex flex-1 flex-col md:ml-60">
        <SetupBanner clinicId={clinicId} whatsappStatus={clinic.whatsappStatus} />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
