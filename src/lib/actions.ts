
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { addDoc, collection, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import type { Consulta } from './types';


export async function addConsulta(data: Omit<Consulta, 'id'>) {
    try {
        const { fechaConsulta, fechaControl, ...rest } = data;
        const dataToSave = {
            ...rest,
            fechaConsulta: Timestamp.fromDate(new Date(fechaConsulta)),
            fechaControl: Timestamp.fromDate(new Date(fechaControl)),
        };
        await addDoc(collection(db, 'consultas'), dataToSave);
        revalidatePath('/consultas');
        revalidatePath('/');
    } catch (error) {
        console.error("Error adding consulta: ", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        throw new Error(errorMessage);
    }
}

export async function updateConsulta(id: string, data: Partial<Omit<Consulta, 'id'>>) {
    try {
        const docRef = doc(db, 'consultas', id);
        
        const updateData: { [key: string]: any } = { ...data };
        
        if (data.fechaConsulta) {
            updateData.fechaConsulta = Timestamp.fromDate(new Date(data.fechaConsulta));
        }
        if (data.fechaControl) {
            updateData.fechaControl = Timestamp.fromDate(new Date(data.fechaControl));
        }

        await updateDoc(docRef, updateData);
        revalidatePath('/consultas');
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating document: ", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        throw new Error(errorMessage);
    }
}


export async function deleteConsulta(id: string) {
    try {
        await deleteDoc(doc(db, 'consultas', id));
        revalidatePath('/consultas');
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting document: ", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        throw new Error(errorMessage);
    }
}
