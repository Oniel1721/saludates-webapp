import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <nav className="flex gap-4 border-b border-zinc-200 px-4 pt-4">
        <Link href="/settings/clinic" className="pb-2 text-sm">Clínica</Link>
        <Link href="/settings/services" className="pb-2 text-sm">Servicios</Link>
        <Link href="/settings/availability" className="pb-2 text-sm">Disponibilidad</Link>
        <Link href="/settings/whatsapp" className="pb-2 text-sm">WhatsApp</Link>
      </nav>
      {children}
    </div>
  );
}
