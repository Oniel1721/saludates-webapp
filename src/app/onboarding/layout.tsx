import { api } from "@/lib/api";
import { getServerClinicId, getServerPayload } from "@/lib/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
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

  if (clinic.onboardingDone) {
    return redirect("/agenda");
  }

  return <div className="flex min-h-screen flex-col">{children}</div>;
}
