"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { DevPanel } from "@/components/dev-panel";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Este campo es requerido."),
  address: z.string().min(1, "Este campo es requerido."),
});

type FormValues = z.infer<typeof schema>;
type PageState = "idle" | "saving";

const DEV_STATES = [
  { label: "Vacío", value: "idle" as PageState },
  { label: "Guardando", value: "saving" as PageState },
];

export default function OnboardingClinicPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("idle");

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", address: "" },
  });

  function onSubmit() {
    setPageState("saving");
    setTimeout(() => router.push("/onboarding/whatsapp"), 1000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-sm flex-col gap-8">

        <OnboardingProgress step={1} total={4} />

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-900">Datos del consultorio</h1>
          <p className="text-sm text-zinc-500">Así se identificará tu consultorio con los pacientes.</p>
        </div>

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

            <Button type="submit" disabled={pageState === "saving"} className="w-full mt-2">
              {pageState === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </form>
        </Form>

      </div>

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
