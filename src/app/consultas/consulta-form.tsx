
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import type { Consulta } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const consultaSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  cedula: z.string().min(1, { message: 'La cédula es requerida.' }),
  fechaConsulta: z.date({ required_error: 'La fecha de consulta es requerida.' }),
  fechaControl: z.date({ required_error: 'La fecha de control es requerida.' }),
  estudio: z.string().min(1, { message: 'El estudio es requerido.' }),
  educador: z.string().min(1, { message: 'El educador es requerido.' }),
  observaciones: z.string().optional(),
  estado: z.enum(['Agendada', 'Pendiente', 'Completa'], { required_error: 'El estado es requerido.'}),
}).refine(data => data.fechaControl >= data.fechaConsulta, {
  message: 'La fecha de control no puede ser anterior a la de consulta.',
  path: ['fechaControl'],
});

type ConsultaFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (consulta: Omit<Consulta, 'id'> | Consulta) => void;
  initialData?: Consulta | null;
};

export const studyOptions = [
    'Pediatría',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Control',
    'Salud Sexual y Reproductiva',
    'Otros'
];

export function ConsultaForm({ isOpen, setIsOpen, onSubmit, initialData }: ConsultaFormProps) {
  const form = useForm<z.infer<typeof consultaSchema>>({
    resolver: zodResolver(consultaSchema),
    defaultValues: initialData ? {
      ...initialData,
      fechaConsulta: parseISO(initialData.fechaConsulta),
      fechaControl: parseISO(initialData.fechaControl),
    } : {
      nombre: '',
      cedula: '',
      estudio: '',
      educador: '',
      observaciones: '',
      estado: 'Agendada',
    }
  });

  const handleFormSubmit = (values: z.infer<typeof consultaSchema>) => {
    const consultaData: Omit<Consulta, 'id'> | Consulta = {
      ...values,
      fechaConsulta: values.fechaConsulta.toISOString(),
      fechaControl: values.fechaControl.toISOString(),
    };
    
    if (initialData?.id) {
        (consultaData as Consulta).id = initialData.id;
    }
    
    onSubmit(consultaData);
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (open) {
      form.reset(initialData ? {
        ...initialData,
        fechaConsulta: parseISO(initialData.fechaConsulta),
        fechaControl: parseISO(initialData.fechaControl),
      } : {
        nombre: '',
        cedula: '',
        estudio: '',
        educador: '',
        observaciones: '',
        estado: 'Agendada',
        fechaConsulta: undefined,
        fechaControl: undefined,
      });
    }
    setIsOpen(open);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Consulta' : 'Nueva Consulta'}</DialogTitle>
          <DialogDescription className="sr-only">
            {initialData ? 'Formulario para editar una consulta médica existente.' : 'Formulario para crear una nueva consulta médica.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1.234.567-8" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fechaConsulta"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Consulta</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaControl"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Control</FormLabel>
                     <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="estudio"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Estudio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un estudio" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {studyOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="educador"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Educador/a</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: Ana Rodriguez" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Agendada">Agendada</SelectItem>
                            <SelectItem value="Pendiente">Pendiente</SelectItem>
                            <SelectItem value="Completa">Completa</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anotaciones adicionales..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

