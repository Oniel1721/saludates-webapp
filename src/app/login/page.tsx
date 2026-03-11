"use server";

import { cookies } from "next/headers";
import { getServerPayload } from "@/lib/cookies";
import { LoginWithGoogle } from "./login-with-google";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const payload = getServerPayload(cookieStore);

  if (payload?.role === "SUPERADMIN") {
    return redirect("/superadmin");
  }
  else if(payload?.role === "CLINIC_USER"){
    return redirect("/agenda");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        {/* Logo + branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
            <span className="text-4xl">🩺</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Saludates
            </h1>
            <p className="text-base text-zinc-500">Tu secretaria digital</p>
          </div>
        </div>

        <div className="w-full">
          <LoginWithGoogle />
        </div>
      </div>

      <p className="absolute bottom-8 text-sm text-zinc-400">
        Solo para consultorios autorizados
      </p>
    </div>
  );
}
