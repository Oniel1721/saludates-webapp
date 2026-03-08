"use client";

import { useEffect } from "react";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useClinic, useUpdateClinic } from "@/lib/hooks/use-clinic";

const schema = z.object({
  name: z.string().min(1, "Este campo es requerido."),
  address: z.string().min(1, "Este campo es requerido."),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsClinicPage() {
  const { clinicId } = useAuth();
  const { data: clinic } = useClinic(clinicId ?? "");
  const updateClinic = useUpdateClinic(clinicId ?? "");

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", address: "" },
  });

  useEffect(() => {
    if (clinic) {
      form.reset({ name: clinic.name, address: clinic.address });
    }
  }, [clinic, form]);

  function onSubmit(values: FormValues) {
    updateClinic.mutate(values);
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

          {updateClinic.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Cambios guardados.
            </div>
          )}

          {updateClinic.isError && (
            <p className="text-sm text-red-500">
              No pudimos guardar los cambios. Intenta de nuevo.
            </p>
          )}

          <Button
            type="submit"
            disabled={updateClinic.isPending}
            className="w-full"
          >
            {updateClinic.isPending ? (
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
    </div>
  );
}
