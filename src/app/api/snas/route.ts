import { NextResponse } from 'next/server';
import { getSNAs } from '@/lib/data';

export async function GET() {
  try {
    const snas = await getSNAs();
    return NextResponse.json(snas);
  } catch (error) {
    console.error('Error fetching SNAs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SNAs' },
      { status: 500 }
    );
  }
} 