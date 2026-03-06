"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { drPhoneSchema } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { DevPanel } from "@/components/dev-panel";
import { Loader2, CheckCircle2, RefreshCw } from "lucide-react";

const schema = z.object({
  phone: drPhoneSchema,
});

type FormValues = z.infer<typeof schema>;

type PageState =
  | "entering-number"
  | "generating-qr"
  | "qr-visible"
  | "qr-expired"
  | "connecting"
  | "connected"
  | "error";

const DEV_STATES = [
  { label: "Ingresando número", value: "entering-number" as PageState },
  { label: "Generando QR", value: "generating-qr" as PageState },
  { label: "QR visible", value: "qr-visible" as PageState },
  { label: "QR expirado", value: "qr-expired" as PageState },
  { label: "Conectando", value: "connecting" as PageState },
  { label: "Conectado", value: "connected" as PageState },
  { label: "Error", value: "error" as PageState },
];

const QR_TIMEOUT = 60;

export default function OnboardingWhatsAppPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("entering-number");
  const [timer, setTimer] = useState(QR_TIMEOUT);

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { phone: "" },
  });

  useEffect(() => {
    if (state !== "qr-visible") return;
    setTimer(QR_TIMEOUT);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setState("qr-expired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  function onSubmit() {
    setState("generating-qr");
    setTimeout(() => setState("qr-visible"), 1500);
  }

  function handleGenerateQR() {
    setState("generating-qr");
    setTimeout(() => setState("qr-visible"), 1500);
  }

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-sm flex-col gap-8">

        <OnboardingProgress step={2} total={4} />

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-900">Conecta tu WhatsApp</h1>
          <p className="text-sm text-zinc-500">Escanea el código QR desde el WhatsApp de tu consultorio.</p>
        </div>

        <div className="flex flex-col gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de WhatsApp del consultorio</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={state !== "entering-number"}
                        />
                      </FormControl>
                      {state === "entering-number" && (
                        <Button type="submit">Generar QR</Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {state === "generating-qr" && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">Generando código QR...</p>
            </div>
          )}

          {(state === "qr-visible" || state === "qr-expired") && (
            <div className="flex flex-col items-center gap-4">
              <div className={`relative rounded-xl border-2 p-4 ${state === "qr-expired" ? "border-zinc-200 opacity-40" : "border-zinc-200"}`}>
                <svg viewBox="0 0 100 100" className="h-48 w-48" aria-label="Código QR">
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="30" height="30" fill="black" rx="2" />
                  <rect x="8" y="8" width="24" height="24" fill="white" rx="1" />
                  <rect x="11" y="11" width="18" height="18" fill="black" rx="1" />
                  <rect x="65" y="5" width="30" height="30" fill="black" rx="2" />
                  <rect x="68" y="8" width="24" height="24" fill="white" rx="1" />
                  <rect x="71" y="11" width="18" height="18" fill="black" rx="1" />
                  <rect x="5" y="65" width="30" height="30" fill="black" rx="2" />
                  <rect x="8" y="68" width="24" height="24" fill="white" rx="1" />
                  <rect x="11" y="71" width="18" height="18" fill="black" rx="1" />
                  {[40,45,50,55,60].map((x) =>
                    [5,10,15,20,25,30].map((y) => (
                      <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill={(x + y) % 7 < 3 ? "black" : "white"} />
                    ))
                  )}
                  {[5,15,25,35,45,55,65,75,85].map((x) =>
                    [40,50,60,70,80,90].map((y) => (
                      <rect key={`d-${x}-${y}`} x={x} y={y} width="4" height="4" fill={(x * y) % 11 < 5 ? "black" : "white"} />
                    ))
                  )}
                </svg>
              </div>

              {state === "qr-visible" ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-zinc-500">
                    El código expira en{" "}
                    <span className="font-medium text-zinc-900">
                      {minutes}:{seconds.toString().padStart(2, "0")}
                    </span>
                  </p>
                  <p className="text-center text-xs text-zinc-400">
                    Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea este código
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-zinc-500">El código expiró.</p>
                  <Button variant="outline" size="sm" onClick={handleGenerateQR}>
                    <RefreshCw className="h-4 w-4" />
                    Generar nuevo código
                  </Button>
                </div>
              )}
            </div>
          )}

          {state === "connecting" && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm text-zinc-500">Verificando conexión...</p>
            </div>
          )}

          {state === "connected" && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">¡WhatsApp conectado exitosamente!</p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-600">No pudimos conectar. Intenta de nuevo.</p>
              <Button variant="outline" size="sm" onClick={handleGenerateQR}>
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={() => router.push("/onboarding/services")}
          disabled={state !== "connected"}
          className="w-full"
        >
          Continuar
        </Button>

      </div>

      <DevPanel states={DEV_STATES} current={state} onSelect={setState} />
    </div>
  );
}
