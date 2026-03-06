import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-5xl font-bold text-zinc-900">404</p>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-700">Página no encontrada</p>
        <p className="text-xs text-zinc-400">La página que buscas no existe o fue movida.</p>
      </div>
      <Link
        href="/agenda"
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
