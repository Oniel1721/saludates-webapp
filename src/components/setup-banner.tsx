"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useServices } from "@/lib/hooks/use-services";
import { useSchedule } from "@/lib/hooks/use-availability";
import type { WhatsAppStatus } from "@/lib/api";

interface SetupBannerProps {
  clinicId: string;
  whatsappStatus: WhatsAppStatus;
}

interface BannerConfig {
  message: string;
  href: string;
  cta: string;
}

export function SetupBanner({ clinicId, whatsappStatus }: SetupBannerProps) {
  const { data: services, isLoading: servicesLoading } = useServices(clinicId);
  const { data: schedules, isLoading: schedulesLoading } = useSchedule(clinicId);

  if (servicesLoading || schedulesLoading) return null;

  const hasWhatsApp = whatsappStatus === "CONNECTED";
  const hasAvailability = schedules?.some((s) => s.isActive) ?? false;
  const hasServices = (services?.length ?? 0) > 0;

  let banner: BannerConfig | null = null;

  if (!hasWhatsApp) {
    banner = {
      message: "Conecta tu WhatsApp para que el bot pueda recibir mensajes.",
      href: "/settings/whatsapp",
      cta: "Conectar ahora",
    };
  } else if (!hasAvailability) {
    banner = {
      message: "Configura tu disponibilidad para recibir citas.",
      href: "/settings/availability",
      cta: "Configurar horarios",
    };
  } else if (!hasServices) {
    banner = {
      message: "Agrega al menos un servicio para que los pacientes puedan agendar.",
      href: "/settings/services",
      cta: "Agregar servicios",
    };
  }

  if (!banner) return null;

  return (
    <div className="flex items-center gap-3 bg-amber-50 px-4 py-3 text-sm border-b border-amber-100">
      <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
      <p className="flex-1 text-amber-800">{banner.message}</p>
      <Link
        href={banner.href}
        className="shrink-0 font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
      >
        {banner.cta}
      </Link>
    </div>
  );
}
