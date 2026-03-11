"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
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
  | "qr-generating"
  | "qr-error"
  | "connecting"
  | "need_scan"
  | "connected"
  | "disconnected"
  | "logged_out"
  | "expired";

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
      setPageState(status.status === "need_scan" ? "need_scan" : status.status);
    }).catch(() => setPageState("disconnected"));
    return () => stopPolling();
  }, [clinicId]);

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!clinicId) return;
      try {
        const status = await api.whatsapp.getStatus(clinicId);
        const s = status.status;
        if (s === "connected") {
          stopPolling();
          setConnectedPhone(status.phone);
          setPageState("connected");
        } else if (s === "need_scan") {
          if (status.qrCode) QRCode.toDataURL(status.qrCode).then(setQrData);
          setPageState("need_scan");
        } else if (s === "connecting") {
          setPageState("connecting");
        } else {
          stopPolling();
          setPageState(s);
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
      if (result.status === "connected") {
        setConnectedPhone(result.phone);
        setPageState("connected");
        return;
      }
      if (result.qrCode) QRCode.toDataURL(result.qrCode).then(setQrData);
      setPageState("need_scan");
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
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">

      {pageState === "connected" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <Wifi className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-emerald-800">Conectado</p>
                {connectedPhone && <p className="text-sm text-emerald-600">{connectedPhone}</p>}
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm text-zinc-400">El bot está activo y recibiendo mensajes de WhatsApp.</p>
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
            onClick={handleDisconnect}
          >
            Desconectar WhatsApp
          </Button>
        </div>
      )}

      {(pageState === "disconnected" || pageState === "logged_out" || pageState === "expired") && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
              <WifiOff className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-700">
                {pageState === "logged_out" ? "Sesión cerrada" : pageState === "expired" ? "Sesión expirada" : "Desconectado"}
              </p>
              <p className="text-sm text-zinc-400">
                {pageState === "logged_out" ? "WhatsApp cerró la sesión." : pageState === "expired" ? "La sesión expiró, vuelve a conectar." : "El bot no está activo."}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleConnect)} className="flex flex-col gap-4">
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
        <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 p-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-base text-zinc-500">Generando código QR...</p>
        </div>
      )}

      {pageState === "connecting" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-base text-zinc-600">Verificando conexión...</p>
        </div>
      )}

      {pageState === "need_scan" && (
        <div className="flex flex-col items-center gap-5">
          <div className="relative rounded-2xl border-2 border-zinc-200 p-5 shadow-sm">
            {qrData ? (
              <img src={qrData} alt="Código QR" className="h-52 w-52" />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-zinc-700">Escanea el código QR</p>
            <p className="mt-1 text-sm text-zinc-400">
              WhatsApp → Dispositivos vinculados → Vincular dispositivo
            </p>
          </div>
        </div>
      )}

      {pageState === "qr-error" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-6">
          <XCircle className="h-8 w-8 text-red-400" />
          <p className="text-base font-medium text-red-600">No pudimos conectar. Intenta de nuevo.</p>
          <Button variant="outline" size="sm" onClick={handleReconnect} className="border-red-300 text-red-600 hover:bg-red-100">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      )}

    </div>
  );
}
