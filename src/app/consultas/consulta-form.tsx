
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Trash2, Share2, FileText, User, CreditCard, Stethoscope, UserCheck, FileEdit, Save, X, Calendar as CalendarIcon2, Building2, Clock, Edit3, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormWrapper } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { addConsulta, updateConsulta } from '@/lib/actions';
import type { Consulta } from '@/lib/types';
import { DialogClose } from '@radix-ui/react-dialog';

// Función para validar cantidad de números en cédula
function validarCantidadNumeros(cedula: string): boolean {
  // Remover puntos y guiones
  const cedulaLimpia = cedula.replace(/[.-]/g, '');
  
  // Verificar que tenga exactamente 8 dígitos
  return /^\d{8}$/.test(cedulaLimpia);
}

// Función para formatear cédula uruguaya
function formatearCedula(cedula: string): string {
  const cedulaLimpia = cedula.replace(/[.-]/g, '');
  if (cedulaLimpia.length <= 1) return cedulaLimpia;
  if (cedulaLimpia.length <= 3) return cedulaLimpia.slice(0, 1) + '.' + cedulaLimpia.slice(1);
  if (cedulaLimpia.length <= 6) return cedulaLimpia.slice(0, 1) + '.' + cedulaLimpia.slice(1, 4) + '.' + cedulaLimpia.slice(4);
  return cedulaLimpia.slice(0, 1) + '.' + cedulaLimpia.slice(1, 4) + '.' + cedulaLimpia.slice(4, 7) + '-' + cedulaLimpia.slice(7);
}

const consultaSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  cedula: z.string()
    .min(1, { message: 'La cédula es requerida.' })
    .refine((cedula) => validarCantidadNumeros(cedula), { 
      message: 'La cédula debe tener exactamente 8 dígitos.' 
    }),
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
  onDelete?: (id: string) => void;
  onShare?: (consulta: Consulta) => void;
  onSharePDF?: (consulta: Consulta) => void;
  onDownloadPDF?: (consulta: Consulta) => void;
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

export function ConsultaForm({ isOpen, setIsOpen, onSubmit, onDelete, onShare, onSharePDF, onDownloadPDF, initialData }: ConsultaFormProps) {
  
  const [fechaConsultaOpen, setFechaConsultaOpen] = useState(false);
  const [fechaControlOpen, setFechaControlOpen] = useState(false);
  
  // Verificar si el formulario está completo
  const isFormComplete = () => {
    const values = form.getValues();
    return (
      values.nombre?.trim().length >= 3 &&
      validarCantidadNumeros(values.cedula || '') &&
      values.fechaConsulta &&
      values.fechaControl &&
      values.estudio?.trim() &&
      values.educador?.trim()
    );
  };
  
  // Obtener campos faltantes para mostrar mensaje
  const getCamposFaltantes = () => {
    const values = form.getValues();
    const faltantes = [];
    
    if (!values.nombre?.trim() || values.nombre.trim().length < 3) {
      faltantes.push('Nombre (mínimo 3 caracteres)');
    }
    if (!validarCantidadNumeros(values.cedula || '')) {
      faltantes.push('Cédula (8 dígitos)');
    }
    if (!values.fechaConsulta) {
      faltantes.push('Fecha de consulta');
    }
    if (!values.fechaControl) {
      faltantes.push('Fecha de control');
    }
    if (!values.estudio?.trim()) {
      faltantes.push('Tipo de estudio');
    }
    if (!values.educador?.trim()) {
      faltantes.push('Educador/a');
    }
    
    return faltantes;
  };
  
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

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      console.log('Reseteando formulario con datos:', initialData);
      
      // Asegurar que las fechas se parseen correctamente
      let fechaConsulta: Date;
      let fechaControl: Date;
      
      try {
        fechaConsulta = typeof initialData.fechaConsulta === 'string' 
          ? parseISO(initialData.fechaConsulta) 
          : new Date(initialData.fechaConsulta);
      } catch (error) {
        console.error('Error parsing fechaConsulta:', error);
        fechaConsulta = new Date();
      }
      
      try {
        fechaControl = typeof initialData.fechaControl === 'string' 
          ? parseISO(initialData.fechaControl) 
          : new Date(initialData.fechaControl);
      } catch (error) {
        console.error('Error parsing fechaControl:', error);
        fechaControl = new Date();
      }

      const formData = {
        ...initialData,
        fechaConsulta,
        fechaControl,
      };
      
      console.log('Datos procesados para el formulario:', formData);
      
      form.reset(formData);
      
      // Remover el foco después del reset para evitar auto-selección
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 150);
    } else if (!initialData && isOpen) {
      // Reset to empty form for new consulta
      console.log('Reseteando formulario para nueva consulta');
      form.reset({
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
  }, [initialData, isOpen, form]);

  // Reset form when opening without initialData (new consulta)
  useEffect(() => {
    if (isOpen && !initialData) {
      console.log('Abriendo formulario para nueva consulta');
      form.reset({
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
  }, [isOpen, initialData, form]);

  // Prevenir auto-focus cuando el diálogo se abre
  useEffect(() => {
    if (isOpen) {
      const removeFocus = () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      };

      // Ejecutar después de que el diálogo se abra completamente
      const timeoutId = setTimeout(removeFocus, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

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
    if (!open) {
      // Reset form when closing - clear all data
      form.reset({
        nombre: '',
        cedula: '',
        estudio: '',
        educador: '',
        observaciones: '',
        estado: 'Agendada',
        fechaConsulta: undefined,
        fechaControl: undefined,
      });
      
      // Clear any focus to prevent issues
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 100);
    }
    setIsOpen(open);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 shadow-lg">
        <DialogHeader className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-800 rounded-t-lg -mt-6 -mx-6 px-6 py-3 mb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            {initialData ? (
              <>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                </div>
                Editar Consulta
              </>
            ) : (
              <>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                Nueva Consulta
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1 text-sm">
            {initialData ? 'Modifica los datos de la consulta médica.' : 'Completa los datos para crear una nueva consulta médica.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormWrapper onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre del Adolescente
                  </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ingrese el nombre completo del adolescente" 
                        {...field} 
                        className="bg-white/90 border-gray-200 focus:border-gray-400 focus:ring-gray-400 placeholder:text-gray-400 h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
              <FormField
                control={form.control}
                name="cedula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cédula de Identidad
                  </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: 1.234.567-8" 
                        value={field.value}
                        onChange={(e) => {
                          const valor = e.target.value;
                          // Solo permitir números, puntos y guiones
                          const valorLimpio = valor.replace(/[^\d.-]/g, '');
                          
                          // Si está completamente vacío, permitir borrar
                          if (valorLimpio === '') {
                            field.onChange('');
                            return;
                          }
                          
                          // Solo formatear si tiene exactamente 8 dígitos
                          const soloNumeros = valorLimpio.replace(/[.-]/g, '');
                          if (soloNumeros.length === 8) {
                            const valorFormateado = formatearCedula(valorLimpio);
                            field.onChange(valorFormateado);
                          } else {
                            // Si no tiene 8 dígitos, mantener el valor limpio
                            field.onChange(valorLimpio);
                          }
                        }}
                        onBlur={(e) => {
                          // Al perder el foco, intentar formatear si tiene 8 dígitos
                          const valor = e.target.value;
                          const soloNumeros = valor.replace(/[.-]/g, '');
                          if (soloNumeros.length === 8) {
                            const valorFormateado = formatearCedula(valor);
                            field.onChange(valorFormateado);
                          }
                        }}
                        className="bg-white/90 border-gray-200 focus:border-gray-400 focus:ring-gray-400 placeholder:text-gray-400 h-9"
                        maxLength={11} // 8 dígitos + 3 caracteres de formato
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Ingrese exactamente 8 dígitos. Se formateará automáticamente al completar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
              <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2 text-sm">
                <CalendarIcon2 className="h-4 w-4" />
                Fechas de la Consulta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="fechaConsulta"
                  render={({ field }) => (
                                      <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                      <CalendarIcon2 className="h-4 w-4" />
                      Fecha de Consulta
                    </FormLabel>
                    <Popover open={fechaConsultaOpen} onOpenChange={setFechaConsultaOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal bg-white/90 border-gray-200 hover:bg-gray-50 hover:border-gray-400 h-9',
                              !field.value && 'text-gray-400'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 text-gray-500" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-gray-200" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setFechaConsultaOpen(false);
                            }}
                            className="bg-white"
                            locale={es}
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
                    <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Fecha de Control
                    </FormLabel>
                     <Popover open={fechaControlOpen} onOpenChange={setFechaControlOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal bg-white/90 border-gray-200 hover:bg-gray-50 hover:border-gray-400 h-9',
                              !field.value && 'text-gray-400'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 text-gray-500" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-gray-200" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setFechaControlOpen(false);
                            }}
                            className="bg-white"
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
              <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" />
                Información Médica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                  control={form.control}
                  name="estudio"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Tipo de Estudio
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                              <SelectTrigger className="bg-white/90 border-gray-200 focus:border-gray-400 focus:ring-gray-400 h-9">
                                  <SelectValue placeholder="Seleccione un estudio" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border-gray-200">
                                  {studyOptions.map(option => (
                                      <SelectItem key={option} value={option} className="hover:bg-gray-50">{option}</SelectItem>
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
                      <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Educador/a
                  </FormLabel>
                      <FormControl>
                          <Input 
                            placeholder="Ej: Ana Rodriguez" 
                            {...field} 
                            className="bg-white/90 border-gray-200 focus:border-gray-400 focus:ring-gray-400 placeholder:text-gray-400 h-9"
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Estado de la Consulta
                  </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger className="bg-white/90 border-gray-200 focus:border-gray-400 focus:ring-gray-400 h-9">
                                <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="Agendada" className="hover:bg-gray-50">🟦 Agendada</SelectItem>
                            <SelectItem value="Pendiente" className="hover:bg-gray-50">⏳ Pendiente</SelectItem>
                            <SelectItem value="Completa" className="hover:bg-gray-50">✅ Completa</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    Observaciones
                  </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Anotaciones adicionales, notas médicas, recomendaciones..." 
                        {...field} 
                        className="bg-white/90 border-gray-200 focus:border-gray-400 focus:ring-gray-400 placeholder:text-gray-400 min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gradient-to-r from-gray-50 to-slate-50 -mx-6 -mb-6 px-6 py-3 border-t border-gray-200">
              {/* Mensaje de campos faltantes */}
              {!isFormComplete() && (
                <div className="w-full mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800 font-medium mb-1">
                    ⚠️ Complete los siguientes campos para {initialData ? 'actualizar' : 'guardar'}:
                  </p>
                  <p className="text-xs text-yellow-700">
                    {getCamposFaltantes().join(', ')}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                <div className="flex items-center gap-2">
                  {initialData && onDelete && (
                    <Button 
                      type="button" 
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar esta consulta? Esta acción no se puede deshacer.')) {
                          onDelete(initialData.id);
                          setIsOpen(false);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2"
                      title="Eliminar consulta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {initialData && onShare && (
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      onClick={() => onShare(initialData)}
                      className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 shadow-md hover:shadow-lg transition-all duration-200 p-2"
                      title="Compartir global"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                  {initialData && onDownloadPDF && (
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadPDF(initialData)}
                      className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-200 p-2"
                      title="Descargar PDF"
                    >
                      <FileText className="h-4 w-4" />
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <DialogClose asChild>
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs px-3 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit"
                    size="sm"
                    disabled={!isFormComplete()}
                    className={cn(
                      "text-xs px-3 flex items-center gap-2 shadow-md transition-all duration-200",
                      isFormComplete() 
                        ? "bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white hover:shadow-lg" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                    title={!isFormComplete() ? `Complete todos los campos requeridos para ${initialData ? 'actualizar' : 'guardar'}` : ""}
                  >
                    <Save className="h-4 w-4" />
                    {initialData ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </FormWrapper>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

