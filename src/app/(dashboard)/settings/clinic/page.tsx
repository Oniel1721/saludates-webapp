"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DevPanel } from "@/components/dev-panel";
import { Loader2, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Este campo es requerido."),
  address: z.string().min(1, "Este campo es requerido."),
});

type FormValues = z.infer<typeof schema>;
type PageState = "idle" | "saving" | "saved" | "error";

const DEV_STATES = [
  { label: "Editable",   value: "idle" as PageState },
  { label: "Guardando",  value: "saving" as PageState },
  { label: "Guardado",   value: "saved" as PageState },
  { label: "Error",      value: "error" as PageState },
];

export default function SettingsClinicPage() {
  const [pageState, setPageState] = useState<PageState>("idle");

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      name: "Consultorio Dra. Martínez",
      address: "Calle El Sol #45, Santiago",
    },
  });

  function onSubmit() {
    setPageState("saving");
    setTimeout(() => setPageState("saved"), 1000);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del consultorio</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Consultorio Dra. Martínez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Calle El Sol #45, Santiago" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {pageState === "saved" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Cambios guardados.
            </div>
          )}

          {pageState === "error" && (
            <p className="text-sm text-red-500">
              No pudimos guardar los cambios. Intenta de nuevo.
            </p>
          )}

          <Button
            type="submit"
            disabled={pageState === "saving"}
            className="w-full"
            onClick={() => setPageState("idle")}
          >
            {pageState === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </form>
      </Form>

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
