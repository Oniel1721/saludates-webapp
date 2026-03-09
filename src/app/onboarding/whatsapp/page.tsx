"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { drPhoneSchema } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

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

const POLL_INTERVAL = 3000; // 3s

export default function OnboardingWhatsAppPage() {
  const router = useRouter();
  const { clinicId } = useAuth();
  const [state, setState] = useState<PageState>("entering-number");
  const [qrData, setQrData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { phone: "" },
  });

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => () => stopPolling(), []);

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!clinicId) return;
      try {
        const status = await api.whatsapp.getStatus(clinicId);
        if (status.status === "CONNECTED") {
          stopPolling();
          setState("connected");
        } else if (status.status === "PENDING_QR") {
          if (status.qr) setQrData(status.qr);
          setState("qr-visible");
        } else {
          // DISCONNECTED — QR expired or not yet created
          stopPolling();
          setState("qr-expired");
        }
      } catch {
        stopPolling();
        setState("error");
      }
    }, POLL_INTERVAL);
  }

  async function requestQr(phone: string) {
    if (!clinicId) return;
    setErrorMsg("");
    setState("generating-qr");
    try {
      const result = await api.whatsapp.connect(clinicId, { phone });
      if (result.status === "CONNECTED") {
        setState("connected");
        return;
      }
      if (result.qr) setQrData(result.qr);
      setState("qr-visible");
      startPolling();
    } catch {
      setErrorMsg("No pudimos generar el código QR. Intenta de nuevo.");
      setState("error");
    }
  }

  async function onSubmit(values: FormValues) {
    await requestQr(values.phone);
  }

  async function handleGenerateQR() {
    const phone = form.getValues("phone");
    await requestQr(phone);
  }

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
                {qrData ? (
                  <img src={qrData} alt="Código QR" className="h-48 w-48" />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                  </div>
                )}
              </div>

              {state === "qr-visible" ? (
                <p className="text-center text-xs text-zinc-400">
                  Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea este código
                </p>
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
              <p className="text-sm text-red-600">{errorMsg || "No pudimos conectar. Intenta de nuevo."}</p>
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

    </div>
  );
}
