
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { addDoc, collection, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import type { Consulta, SNA } from './types';


export async function addConsulta(data: Omit<Consulta, 'id'>) {
    try {
        const { fechaConsulta, fechaControl, ...rest } = data;
        const dataToSave = {
            ...rest,
            fechaConsulta: Timestamp.fromDate(new Date(fechaConsulta)),
            fechaControl: Timestamp.fromDate(new Date(fechaControl)),
        };
        const docRef = await addDoc(collection(db, 'consultas'), dataToSave);
        revalidatePath('/consultas');
        revalidatePath('/');
        return { id: docRef.id, ...data };
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

// SNA Actions
export async function addSNA(data: Omit<SNA, 'id'>) {
    try {
        const { fechaDenuncia, fechaCierre, ...rest } = data;
        const dataToSave = {
            ...rest,
            fechaDenuncia: Timestamp.fromDate(new Date(fechaDenuncia)),
            ...(fechaCierre && { fechaCierre: Timestamp.fromDate(new Date(fechaCierre)) }),
        };
        const docRef = await addDoc(collection(db, 'snas'), dataToSave);
        revalidatePath('/sna');
        revalidatePath('/');
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error adding SNA: ", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        throw new Error(errorMessage);
    }
}

export async function updateSNA(id: string, data: Partial<Omit<SNA, 'id'>>) {
    try {
        const docRef = doc(db, 'snas', id);
        
        const updateData: { [key: string]: any } = { ...data };
        
        if (data.fechaDenuncia) {
            updateData.fechaDenuncia = Timestamp.fromDate(new Date(data.fechaDenuncia));
        }
        if (data.fechaCierre) {
            updateData.fechaCierre = Timestamp.fromDate(new Date(data.fechaCierre));
        }

        await updateDoc(docRef, updateData);
        revalidatePath('/sna');
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating SNA document: ", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        throw new Error(errorMessage);
    }
}

export async function deleteSNA(id: string) {
    try {
        await deleteDoc(doc(db, 'snas', id));
        revalidatePath('/sna');
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting SNA document: ", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        throw new Error(errorMessage);
    }
}
