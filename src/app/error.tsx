"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-5xl font-bold text-zinc-900">500</p>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-700">Algo salió mal</p>
        <p className="text-xs text-zinc-400">Ocurrió un error inesperado. Por favor intenta de nuevo.</p>
      </div>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
