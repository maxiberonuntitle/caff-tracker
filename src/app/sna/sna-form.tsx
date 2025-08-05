'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Share2, 
  Download, 
  Trash2,
  Edit,
  Plus,
  CalendarDays,
  UserCheck,
  Shield,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SNA } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Schema de validación
const snaFormSchema = z.object({
  nombreAdolescente: z.string().min(1, 'El nombre del adolescente es requerido'),
  numeroDenuncia: z.string().min(1, 'El número de denuncia es requerido'),
  fechaDenuncia: z.string().min(1, 'La fecha de denuncia es requerida'),
  fechaCierre: z.string().optional(),
  estado: z.enum(['Abierta', 'Cerrada']),
  constatacionLesiones: z.boolean(),
  retira: z.string().optional(),
  comentarios: z.string().optional(),
});

type SnaFormData = z.infer<typeof snaFormSchema>;

type SNAFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: SnaFormData | SNA) => void;
  onDelete?: (id: string) => void;
  onShare?: (sna: SNA) => void;
  onSharePDF?: (sna: SNA) => void;
  onDownloadPDF?: (sna: SNA) => void;
  initialData?: SNA | null;
};

export function SNAForm({
  isOpen,
  setIsOpen,
  onSubmit,
  onDelete,
  onShare,
  onSharePDF,
  onDownloadPDF,
  initialData,
}: SNAFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SnaFormData>({
    resolver: zodResolver(snaFormSchema),
    defaultValues: {
      nombreAdolescente: '',
      numeroDenuncia: '',
      fechaDenuncia: '',
      fechaCierre: '',
      estado: 'Abierta',
      constatacionLesiones: false,
      retira: '',
      comentarios: '',
    },
  });

  const watchedEstado = watch('estado');
  const watchedConstatacionLesiones = watch('constatacionLesiones');

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Convert ISO dates to YYYY-MM-DD format for date inputs
      const formatDateForInput = (dateString: string | undefined): string => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      reset({
        nombreAdolescente: initialData.nombreAdolescente,
        numeroDenuncia: initialData.numeroDenuncia,
        fechaDenuncia: formatDateForInput(initialData.fechaDenuncia),
        fechaCierre: formatDateForInput(initialData.fechaCierre),
        estado: initialData.estado,
        constatacionLesiones: initialData.constatacionLesiones,
        retira: initialData.retira || '',
        comentarios: initialData.comentarios || '',
      });
    } else {
      reset({
        nombreAdolescente: '',
        numeroDenuncia: '',
        fechaDenuncia: '',
        fechaCierre: '',
        estado: 'Abierta',
        constatacionLesiones: false,
        retira: '',
        comentarios: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: SnaFormData) => {
    setIsSubmitting(true);
    try {
      // Convert date strings to ISO format for storage
      const convertDateToISO = (dateString: string): string => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString + 'T00:00:00.000Z');
          return date.toISOString();
        } catch (error) {
          console.error('Error converting date to ISO:', error);
          return dateString;
        }
      };

      const processedData = {
        ...data,
        fechaDenuncia: convertDateToISO(data.fechaDenuncia),
        fechaCierre: data.fechaCierre ? convertDateToISO(data.fechaCierre) : undefined,
      };

      if (initialData) {
        // Editing existing SNA
        await onSubmit({
          ...initialData,
          ...processedData,
        });
      } else {
        // Creating new SNA
        await onSubmit(processedData);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !onDelete) return;
    
    setIsDeleting(true);
    try {
      onDelete(initialData.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting SNA:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (!initialData || !onShare) return;
    onShare(initialData);
  };

  const handleSharePDF = () => {
    if (!initialData || !onSharePDF) return;
    onSharePDF(initialData);
  };

  const handleDownloadPDF = () => {
    if (!initialData || !onDownloadPDF) return;
    onDownloadPDF(initialData);
  };

  const isEditing = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5" />
                Editar SNA
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Nueva SNA
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isEditing 
              ? 'Modifica los datos de la Salida No Acordada'
              : 'Registra una nueva Salida No Acordada'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
          {/* Información del Adolescente */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Información del Adolescente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombreAdolescente" className="text-sm sm:text-base">Nombre del Adolescente *</Label>
                  <Input
                    id="nombreAdolescente"
                    {...register('nombreAdolescente')}
                    placeholder="Ingresa el nombre completo"
                    className={`text-sm sm:text-base ${errors.nombreAdolescente ? 'border-red-500' : ''}`}
                  />
                  {errors.nombreAdolescente && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.nombreAdolescente.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroDenuncia" className="text-sm sm:text-base">Número de Denuncia *</Label>
                  <Input
                    id="numeroDenuncia"
                    {...register('numeroDenuncia')}
                    placeholder="Ej: 2024-001"
                    className={`text-sm sm:text-base ${errors.numeroDenuncia ? 'border-red-500' : ''}`}
                  />
                  {errors.numeroDenuncia && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.numeroDenuncia.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles de la SNA */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                Detalles de la SNA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fechaDenuncia" className="text-sm sm:text-base">Fecha de Denuncia *</Label>
                  <Input
                    id="fechaDenuncia"
                    type="date"
                    {...register('fechaDenuncia')}
                    className={`text-sm sm:text-base ${errors.fechaDenuncia ? 'border-red-500' : ''}`}
                  />
                  {errors.fechaDenuncia && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.fechaDenuncia.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm sm:text-base">Estado *</Label>
                  <Select
                    value={watchedEstado}
                    onValueChange={(value) => setValue('estado', value as 'Abierta' | 'Cerrada')}
                  >
                    <SelectTrigger className={`text-sm sm:text-base ${errors.estado ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Abierta">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Abierta
                        </div>
                      </SelectItem>
                      <SelectItem value="Cerrada">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Cerrada
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.estado && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.estado.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="constatacionLesiones"
                    checked={watchedConstatacionLesiones}
                    onCheckedChange={(checked) => 
                      setValue('constatacionLesiones', checked as boolean)
                    }
                  />
                  <Label htmlFor="constatacionLesiones" className="text-sm sm:text-base">Constatación de Lesiones</Label>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Marca si se constataron lesiones en el adolescente
                </p>
              </div>

              {/* Campos condicionales para SNA cerrada */}
              {watchedEstado === 'Cerrada' && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fechaCierre" className="text-sm sm:text-base">Fecha de Cierre</Label>
                      <Input
                        id="fechaCierre"
                        type="date"
                        {...register('fechaCierre')}
                        className="text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retira" className="text-sm sm:text-base">Retira (Educador/a)</Label>
                      <Input
                        id="retira"
                        {...register('retira')}
                        placeholder="Nombre del educador/a"
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Comentarios */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Comentarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="comentarios" className="text-sm sm:text-base">Observaciones</Label>
                <Textarea
                  id="comentarios"
                  {...register('comentarios')}
                  placeholder="Agrega comentarios o observaciones relevantes..."
                  rows={4}
                  className="text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <div className="flex flex-wrap justify-start gap-2 w-full sm:w-auto">
              {isEditing && (
                <>
                  {onShare && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleShare}
                      className="flex items-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Compartir</span>
                    </Button>
                  )}
                  
                  {onSharePDF && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSharePDF}
                      className="flex items-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Compartir PDF</span>
                    </Button>
                  )}
                  
                  {onDownloadPDF && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Descargar PDF</span>
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </span>
                    </Button>
                  )}
                </>
              )}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10"
              >
                {isSubmitting ? (
                  'Guardando...'
                ) : isEditing ? (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Actualizar</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Crear SNA</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 