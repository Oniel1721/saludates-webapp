"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useServices } from "@/lib/hooks/use-services";
import { usePatients } from "@/lib/hooks/use-patients";
import { useCreateAppointment } from "@/lib/hooks/use-appointments";
import { drPhoneSchema } from "@/lib/phone";

const schema = z.object({
  patientName: z.string().min(1, "Este campo es requerido."),
  patientPhone: drPhoneSchema,
  serviceId: z.string().min(1, "Selecciona un servicio."),
  date: z.string().min(1, "Este campo es requerido."),
  startTime: z.string().min(1, "Este campo es requerido."),
  price: z.string().min(1, "Este campo es requerido.").regex(/^\d+$/, "Ingresa un número válido."),
});

type FormValues = z.infer<typeof schema>;
type AvailabilityStatus = "idle" | "checking" | "available" | "unavailable" | "outside-hours";

type CreateAppointmentModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  defaultDate?: string;
};

export function CreateAppointmentModal({ open, onClose, onSave, defaultDate }: CreateAppointmentModalProps) {
  const { clinicId } = useAuth();
  const { data: services = [] } = useServices(clinicId ?? "");
  const { data: patients = [] } = usePatients(clinicId ?? "");
  const createAppointment = useCreateAppointment(clinicId ?? "");

  const [patientQuery, setPatientQuery] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");

  const activeServices = services.filter((s) => !s.archivedAt);

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      patientName: "",
      patientPhone: "",
      serviceId: "",
      date: defaultDate ?? "",
      startTime: "",
      price: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ patientName: "", patientPhone: "", serviceId: "", date: defaultDate ?? "", startTime: "", price: "" });
      setPatientQuery("");
      setAvailability("idle");
    }
  }, [open]);

  const watchedDate = form.watch("date");
  const watchedTime = form.watch("startTime");
  const watchedService = form.watch("serviceId");

  // Simulate availability check (TODO: use real API when backend slot check is implemented)
  useEffect(() => {
    if (!watchedDate || !watchedTime) { setAvailability("idle"); return; }
    setAvailability("checking");
    const timer = setTimeout(() => {
      const hour = parseInt(watchedTime.split(":")[0]);
      if (hour < 8 || hour >= 17) { setAvailability("outside-hours"); return; }
      setAvailability("available");
    }, 400);
    return () => clearTimeout(timer);
  }, [watchedDate, watchedTime]);

  // Auto-fill price when service changes
  useEffect(() => {
    if (!watchedService) return;
    const service = activeServices.find((s) => s.id === watchedService);
    if (service) form.setValue("price", String(service.price));
  }, [watchedService, activeServices]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientQuery.toLowerCase()) ||
      p.phone.includes(patientQuery)
  );

  function selectPatient(name: string, phone: string) {
    form.setValue("patientName", name);
    form.setValue("patientPhone", phone);
    setPatientQuery(name);
    setShowPatientDropdown(false);
  }

  function onSubmit(values: FormValues) {
    const startsAt = new Date(`${values.date}T${values.startTime}:00`).toISOString();
    return createAppointment.mutateAsync(
      {
        patientName: values.patientName,
        patientPhone: values.patientPhone,
        serviceId: values.serviceId,
        startsAt,
        price: Number(values.price),
      },
      {
        onSuccess: () => {
          onSave();
          onClose();
        },
        onError: () => {
          alert("No pudimos crear la cita. Verifica el horario e intenta de nuevo.");
        },
      }
    );
  }

  const isSubmitting = form.formState.isSubmitting || createAppointment.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-1">

            {/* Patient search */}
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Buscar paciente o ingresar nuevo..."
                        value={patientQuery}
                        onChange={(e) => {
                          setPatientQuery(e.target.value);
                          field.onChange(e.target.value);
                          setShowPatientDropdown(true);
                        }}
                        onFocus={() => setShowPatientDropdown(true)}
                        onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
                      />
                      {showPatientDropdown && filteredPatients.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-md border border-zinc-200 bg-white shadow-md">
                          {filteredPatients.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onMouseDown={() => selectPatient(p.name, p.phone)}
                              className="flex w-full flex-col px-3 py-2 text-left hover:bg-zinc-50"
                            >
                              <span className="text-sm text-zinc-900">{p.name}</span>
                              <span className="text-xs text-zinc-400">{p.phone}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="patientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
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

            {/* Service */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => {
                const selected = activeServices.find((s) => s.id === field.value);
                return (
                  <FormItem>
                    <FormLabel>Servicio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          {selected ? (
                            <span className="flex flex-1 truncate text-left text-sm text-foreground">
                              {selected.name}
                            </span>
                          ) : (
                            <SelectValue placeholder="Selecciona un servicio" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeServices.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <span className="font-medium">{s.name}</span>
                            <span className="ml-1 text-muted-foreground">· {s.durationMinutes} min · RD${s.price.toLocaleString()}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selected && (
                      <p className="text-xs text-muted-foreground">
                        {selected.durationMinutes} min · RD${selected.price.toLocaleString()}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Availability indicator */}
            {availability !== "idle" && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                availability === "available" ? "bg-emerald-50 text-emerald-700" :
                availability === "unavailable" ? "bg-red-50 text-red-600" :
                availability === "outside-hours" ? "bg-amber-50 text-amber-700" :
                "bg-zinc-50 text-zinc-500"
              }`}>
                {availability === "checking" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {availability === "available" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {availability === "unavailable" && <XCircle className="h-3.5 w-3.5" />}
                {availability === "outside-hours" && <AlertTriangle className="h-3.5 w-3.5" />}
                <span>
                  {availability === "checking" && "Verificando disponibilidad..."}
                  {availability === "available" && "Horario disponible"}
                  {availability === "unavailable" && "Este horario ya está ocupado."}
                  {availability === "outside-hours" && "Este horario está fuera del horario de atención. ¿Deseas continuar de todas formas?"}
                </span>
              </div>
            )}

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">RD$</span>
                      <Input placeholder="0" className="pl-10" inputMode="numeric" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting || availability === "unavailable"}
              className="w-full mt-1"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creando cita...</>
              ) : (
                "Crear cita"
              )}
            </Button>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
