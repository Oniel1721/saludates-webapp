"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { drPhoneSchema } from "@/lib/phone";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type PageState =
  | "loading"
  | "connected"
  | "disconnected"
  | "qr-generating"
  | "qr-visible"
  | "qr-expired"
  | "qr-connecting"
  | "qr-error";

const schema = z.object({ phone: drPhoneSchema });
type FormValues = z.infer<typeof schema>;

const POLL_INTERVAL = 3000;

export default function SettingsWhatsAppPage() {
  const { clinicId } = useAuth();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { phone: "" },
  });

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  useEffect(() => {
    if (!clinicId) return;
    api.whatsapp.getStatus(clinicId).then((status) => {
      setConnectedPhone(status.phone);
      if (status.status === "CONNECTED") setPageState("connected");
      else setPageState("disconnected");
    }).catch(() => setPageState("disconnected"));
    return () => stopPolling();
  }, [clinicId]);

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!clinicId) return;
      try {
        const status = await api.whatsapp.getStatus(clinicId);
        if (status.status === "CONNECTED") {
          stopPolling();
          setConnectedPhone(status.phone);
          setPageState("connected");
        } else if (status.status === "PENDING_QR") {
          if (status.qr) setQrData(status.qr);
          setPageState("qr-visible");
        } else {
          stopPolling();
          setPageState("qr-expired");
        }
      } catch {
        stopPolling();
        setPageState("qr-error");
      }
    }, POLL_INTERVAL);
  }

  async function handleConnect(values: FormValues) {
    if (!clinicId) return;
    setPageState("qr-generating");
    try {
      const result = await api.whatsapp.connect(clinicId, { phone: values.phone });
      if (result.status === "CONNECTED") {
        setConnectedPhone(result.phone);
        setPageState("connected");
        return;
      }
      if (result.qr) setQrData(result.qr);
      setPageState("qr-visible");
      startPolling();
    } catch {
      setPageState("qr-error");
    }
  }

  async function handleDisconnect() {
    if (!clinicId) return;
    await api.whatsapp.disconnect(clinicId).catch(() => {});
    setConnectedPhone(null);
    setPageState("disconnected");
  }

  async function handleReconnect() {
    const phone = form.getValues("phone");
    if (!phone) return;
    await handleConnect({ phone });
  }

  if (pageState === "loading") {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">

      {pageState === "connected" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Conectado</p>
                {connectedPhone && <p className="text-xs text-emerald-600">{connectedPhone}</p>}
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-xs text-zinc-400">El bot está activo y recibiendo mensajes de WhatsApp.</p>
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600"
            onClick={handleDisconnect}
          >
            Desconectar WhatsApp
          </Button>
        </div>
      )}

      {pageState === "disconnected" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-700">Desconectado</p>
                <p className="text-xs text-zinc-400">El bot no está activo.</p>
              </div>
            </div>
            <XCircle className="h-5 w-5 text-zinc-300" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleConnect)} className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de WhatsApp</FormLabel>
                    <FormControl>
                      <PhoneInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Conectar WhatsApp
              </Button>
            </form>
          </Form>
        </div>
      )}

      {pageState === "qr-generating" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-10">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Generando código QR...</p>
        </div>
      )}

      {(pageState === "qr-visible" || pageState === "qr-expired") && (
        <div className="flex flex-col items-center gap-4">
          <div className={`relative rounded-xl border-2 p-4 ${pageState === "qr-expired" ? "border-zinc-200 opacity-40" : "border-zinc-200"}`}>
            {qrData ? (
              <img src={qrData} alt="Código QR" className="h-48 w-48" />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
              </div>
            )}
          </div>

          {pageState === "qr-visible" ? (
            <p className="text-center text-xs text-zinc-400">
              Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea este código
            </p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-zinc-500">El código expiró.</p>
              <Button variant="outline" size="sm" onClick={handleReconnect}>
                <RefreshCw className="h-4 w-4" />
                Generar nuevo código
              </Button>
            </div>
          )}
        </div>
      )}

      {pageState === "qr-connecting" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-500">Verificando conexión...</p>
        </div>
      )}

      {pageState === "qr-error" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">No pudimos conectar. Intenta de nuevo.</p>
          <Button variant="outline" size="sm" onClick={handleReconnect}>
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      )}

    </div>
  );
}
