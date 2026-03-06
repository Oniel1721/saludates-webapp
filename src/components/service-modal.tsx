"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Este campo es requerido."),
  price: z
    .string()
    .min(1, "Este campo es requerido.")
    .regex(/^\d+$/, "Ingresa un número válido."),
  duration: z
    .string()
    .min(1, "Este campo es requerido.")
    .regex(/^\d+$/, "Ingresa un número válido."),
  prerequisites: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export type ServiceData = {
  id?: number;
  name: string;
  price: number;
  duration: number;
  prerequisites?: string;
};

type ServiceModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceData) => void;
  initial?: ServiceData;
  showPriceWarning?: boolean;
};

export function ServiceModal({ open, onClose, onSave, initial, showPriceWarning = true }: ServiceModalProps) {
  const isEditing = !!initial;

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      prerequisites: "",
    },
  });

  const priceValue = form.watch("price");
  const priceChanged = isEditing && priceValue !== String(initial?.price ?? "");

  useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? "",
        price: initial?.price ? String(initial.price) : "",
        duration: initial?.duration ? String(initial.duration) : "",
        prerequisites: initial?.prerequisites ?? "",
      });
    }
  }, [open, initial]);

  function onSubmit(values: FormValues) {
    setTimeout(() => {
      onSave({
        id: initial?.id,
        name: values.name,
        price: Number(values.price),
        duration: Number(values.duration),
        prerequisites: values.prerequisites || undefined,
      });
      onClose();
    }, 600);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar servicio" : "Agregar servicio"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del servicio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Consulta general" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">RD$</span>
                        <Input placeholder="1500" className="pl-10" inputMode="numeric" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="30" className="pr-14" inputMode="numeric" {...field} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">min</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="prerequisites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prerequisitos <span className="text-zinc-400">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Traer resultados de hemograma reciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showPriceWarning && priceChanged && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Al cambiar el precio, las citas anteriores conservarán el precio original. El nuevo precio aplicará solo a citas nuevas.
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                "Guardar cambios"
              ) : (
                "Agregar servicio"
              )}
            </Button>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
