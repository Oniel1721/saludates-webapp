"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DevPanel } from "@/components/dev-panel";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

type PageState =
  | "connected"
  | "disconnected"
  | "qr-generating"
  | "qr-visible"
  | "qr-expired"
  | "qr-connecting"
  | "qr-error";

const DEV_STATES = [
  { label: "Conectado",        value: "connected" as PageState },
  { label: "Desconectado",     value: "disconnected" as PageState },
  { label: "Generando QR",     value: "qr-generating" as PageState },
  { label: "QR visible",       value: "qr-visible" as PageState },
  { label: "QR expirado",      value: "qr-expired" as PageState },
  { label: "Conectando...",    value: "qr-connecting" as PageState },
  { label: "Error conexión",   value: "qr-error" as PageState },
];

const CONNECTED_PHONE = "+1 (809) 555-0123";
const QR_TIMEOUT = 60;

export default function SettingsWhatsAppPage() {
  const [pageState, setPageState] = useState<PageState>("connected");
  const [timer, setTimer] = useState(QR_TIMEOUT);

  useEffect(() => {
    if (pageState !== "qr-visible") return;
    setTimer(QR_TIMEOUT);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setPageState("qr-expired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pageState]);

  function handleReconnect() {
    setPageState("qr-generating");
    setTimeout(() => setPageState("qr-visible"), 1500);
  }

  function handleDisconnect() {
    setPageState("disconnected");
  }

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="flex flex-col gap-6 px-4 py-6">

      {/* Connection status */}
      {pageState === "connected" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Conectado</p>
                <p className="text-xs text-emerald-600">{CONNECTED_PHONE}</p>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>

          <p className="text-xs text-zinc-400">
            El bot está activo y recibiendo mensajes de WhatsApp.
          </p>

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

          <Button className="w-full" onClick={handleReconnect}>
            Reconectar WhatsApp
          </Button>
        </div>
      )}

      {/* QR flow */}
      {pageState === "qr-generating" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-10">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Generando código QR...</p>
        </div>
      )}

      {(pageState === "qr-visible" || pageState === "qr-expired") && (
        <div className="flex flex-col items-center gap-4">
          <div
            className={`relative rounded-xl border-2 p-4 ${
              pageState === "qr-expired" ? "border-zinc-200 opacity-40" : "border-zinc-200"
            }`}
          >
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
              {[40, 45, 50, 55, 60].map((x) =>
                [5, 10, 15, 20, 25, 30].map((y) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill={(x + y) % 7 < 3 ? "black" : "white"} />
                ))
              )}
              {[5, 15, 25, 35, 45, 55, 65, 75, 85].map((x) =>
                [40, 50, 60, 70, 80, 90].map((y) => (
                  <rect key={`d-${x}-${y}`} x={x} y={y} width="4" height="4" fill={(x * y) % 11 < 5 ? "black" : "white"} />
                ))
              )}
            </svg>
          </div>

          {pageState === "qr-visible" ? (
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-xs text-zinc-500">
                El código expira en{" "}
                <span className="font-medium text-zinc-900">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </p>
              <p className="text-xs text-zinc-400">
                Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea este código
              </p>
            </div>
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

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
