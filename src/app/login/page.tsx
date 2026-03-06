"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type LoginState = "idle" | "loading" | "error-unauthorized" | "error-network";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [state, setState] = useState<LoginState>("idle");

  function handleLogin() {
    setState("loading");

    // Prototype: simulate auth flow
    setTimeout(() => {
      setState("idle");
    }, 2000);
  }

  const errorMessage =
    state === "error-unauthorized"
      ? "Este correo no tiene acceso autorizado. Contacta al administrador del sistema."
      : state === "error-network"
        ? "No pudimos conectarnos. Verifica tu conexión e intenta de nuevo."
        : null;

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

        {/* Login button + error */}
        <div className="flex w-full flex-col items-center gap-3">
          <Button
            onClick={handleLogin}
            disabled={state === "loading"}
            variant="outline"
            className="w-full gap-3 h-11"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <GoogleIcon />
                Iniciar sesión con Google
              </>
            )}
          </Button>

          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </div>

      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-xs text-zinc-400">
        Solo para consultorios autorizados
      </p>
    </div>
  );
}
