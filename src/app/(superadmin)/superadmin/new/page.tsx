"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { DevPanel } from "@/components/dev-panel";
import { drPhoneSchema } from "@/lib/phone";
import { ChevronLeft, Loader2 } from "lucide-react";

const schema = z.object({
  clinicName: z.string().min(1, "Este campo es requerido."),
  doctorName: z.string().min(1, "Este campo es requerido."),
  phone:      drPhoneSchema,
  plan:       z.enum(["basic", "professional"]),
});

type FormValues = z.infer<typeof schema>;
type PageState = "idle" | "saving" | "error";

const DEV_STATES = [
  { label: "Formulario",  value: "idle" as PageState },
  { label: "Guardando",   value: "saving" as PageState },
  { label: "Error",       value: "error" as PageState },
];

const PLANS = [
  {
    value: "basic" as const,
    label: "Básico",
    description: "Hasta 100 citas/mes · 1 usuario",
  },
  {
    value: "professional" as const,
    label: "Profesional",
    description: "Citas ilimitadas · 3 usuarios · Reportes",
  },
];

export default function SuperadminCreatePage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("idle");

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      clinicName: "",
      doctorName: "",
      phone: "",
      plan: "professional",
    },
  });

  function onSubmit() {
    setPageState("saving");
    setTimeout(() => router.push("/superadmin"), 1200);
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="rounded-md p-1 hover:bg-zinc-100"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-500" />
        </button>
        <h1 className="text-sm font-semibold text-zinc-900">Nuevo consultorio</h1>
      </div>

      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Clinic name */}
            <FormField
              control={form.control}
              name="clinicName"
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

            {/* Doctor name */}
            <FormField
              control={form.control}
              name="doctorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del doctor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Dra. Laura Martínez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de WhatsApp</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan */}
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      {PLANS.map((plan) => (
                        <label
                          key={plan.value}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                            field.value === plan.value
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value={plan.value}
                            checked={field.value === plan.value}
                            onChange={() => field.onChange(plan.value)}
                            className="mt-0.5 accent-zinc-900"
                          />
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{plan.label}</p>
                            <p className="text-xs text-zinc-400">{plan.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {pageState === "error" && (
              <p className="text-sm text-red-500">
                No pudimos crear el consultorio. Intenta de nuevo.
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={pageState === "saving"}
              >
                {pageState === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear consultorio"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <DevPanel states={DEV_STATES} current={pageState} onSelect={setPageState} />
    </div>
  );
}
