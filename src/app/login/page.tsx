"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === "SUPERADMIN" ? "/superadmin" : "/agenda");
    }
  }, [user, isLoading, router]);

  async function handleCredential(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return;
    try {
      const loggedUser = await login(credentialResponse.credential);
      router.replace(loggedUser.role === "SUPERADMIN" ? "/superadmin" : "/agenda");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        alert("Este correo no tiene acceso autorizado. Contacta al administrador.");
      } else {
        alert("No pudimos conectarnos. Verifica tu conexión e intenta de nuevo.");
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        {/* Logo + branding */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500">
            <span className="text-3xl">🩺</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Saludates</h1>
            <p className="text-sm text-zinc-500">Tu secretaria digital</p>
          </div>
        </div>

        {isLoading ? (
          <Button disabled variant="outline" className="w-full gap-3 h-11">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            Cargando...
          </Button>
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
            <GoogleLogin
              onSuccess={handleCredential}
              onError={() => alert("Error al iniciar sesión con Google.")}
              useOneTap
              text="signin_with"
              shape="rectangular"
              size="large"
              theme="outline"
            />
          </div>
        )}
      </div>

      <p className="absolute bottom-8 text-xs text-zinc-400">
        Solo para consultorios autorizados
      </p>
    </div>
  );
}
