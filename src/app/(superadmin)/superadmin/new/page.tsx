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
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { api } from "@/lib/api";

const schema = z.object({
  name:    z.string().min(1, "Este campo es requerido."),
  address: z.string().min(1, "Este campo es requerido."),
  emails:  z.array(z.email("Correo inválido.")).min(1, "Agrega al menos un correo."),
});

type FormValues = z.infer<typeof schema>;

export default function SuperadminCreatePage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [emailInputError, setEmailInputError] = useState("");
  const [apiError, setApiError] = useState("");

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", address: "", emails: [] },
  });

  const emails = form.watch("emails");

  function addEmail() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    const result = z.email().safeParse(trimmed);
    if (!result.success) { setEmailInputError("Correo electrónico inválido."); return; }
    if (emails.includes(trimmed)) { setEmailInputError("Este correo ya fue agregado."); return; }
    form.setValue("emails", [...emails, trimmed], { shouldValidate: true });
    setEmailInput("");
    setEmailInputError("");
  }

  function removeEmail(email: string) {
    form.setValue("emails", emails.filter((e) => e !== email), { shouldValidate: true });
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addEmail(); }
  }

  async function onSubmit(values: FormValues) {
    setApiError("");
    try {
      await api.clinics.create({
        name: values.name,
        address: values.address,
        authorizedEmails: values.emails,
      });
      router.push("/superadmin");
    } catch {
      setApiError("No pudimos crear el consultorio. Intenta de nuevo.");
    }
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <button onClick={() => router.back()} className="rounded-md p-1 hover:bg-zinc-100">
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

            {/* Address */}
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

            {/* Emails */}
            <FormField
              control={form.control}
              name="emails"
              render={() => (
                <FormItem>
                  <FormLabel>Correos autorizados</FormLabel>

                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={emailInput}
                      onChange={(e) => { setEmailInput(e.target.value); setEmailInputError(""); }}
                      onKeyDown={handleEmailKeyDown}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addEmail} className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {emailInputError && <p className="text-xs text-red-500">{emailInputError}</p>}

                  {emails.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {emails.map((email) => (
                        <span
                          key={email}
                          className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700"
                        >
                          {email}
                          <button type="button" onClick={() => removeEmail(email)} className="text-zinc-400 hover:text-zinc-700">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {apiError && <p className="text-sm text-red-500">{apiError}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
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
    </div>
  );
}
