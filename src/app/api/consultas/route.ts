import { NextResponse } from 'next/server';
import { getConsultas } from '@/lib/data';

export async function GET() {
  try {
    const consultas = await getConsultas();
    return NextResponse.json(consultas);
  } catch (error) {
    console.error('Error fetching consultas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultas' },
      { status: 500 }
    );
  }
} 