
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Consulta } from './types';

// This function now runs only on the server.
export async function getConsultas(): Promise<Consulta[]> {
    try {
        console.log('🔍 Iniciando consulta a Firebase...');
        const snapshot = await getDocs(collection(db, 'consultas'));
        console.log(`📊 Documentos encontrados: ${snapshot.docs.length}`);
        
        const consultas: Consulta[] = snapshot.docs.map(doc => {
            const data = doc.data();

            const toSafeDate = (value: any): Date => {
                if (value instanceof Timestamp) {
                    return value.toDate();
                }
                if (value && (typeof value === 'string' || typeof value === 'number')) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
                // Return a default date if the value is invalid or missing
                return new Date(); 
            };

            // Validate required fields
            const nombre = data.nombre || 'No definido';
            const cedula = data.cedula || 'No definida';
            const estudio = data.estudio || 'No definido';
            const educador = data.educador || 'No definido';
            const observaciones = data.observaciones || '';
            
            // Validate estado
            const validEstados = ['Agendada', 'Pendiente', 'Completa'];
            const estado = validEstados.includes(data.estado) ? data.estado : 'Pendiente';

            return {
                id: doc.id,
                nombre,
                cedula,
                estudio,
                educador,
                observaciones,
                estado,
                fechaConsulta: toSafeDate(data.fechaConsulta).toISOString(),
                fechaControl: toSafeDate(data.fechaControl).toISOString(),
            };
        });

        // Sort by most recent fechaConsulta
        const sortedConsultas = consultas.sort((a, b) => 
            new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime()
        );
        
        console.log(`✅ Consultas procesadas exitosamente: ${sortedConsultas.length}`);
        return sortedConsultas;

    } catch (error) {
        console.error("❌ Firebase query failed:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: (error as any)?.code,
            stack: error instanceof Error ? error.stack : undefined
        });
        // Return empty array instead of throwing to prevent app crashes
        return [];
    }
}
