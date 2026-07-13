import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tables — list all tables with room info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;

    const tables = await db.table.findMany({
      where,
      include: { room: { select: { id: true, name: true } } },
      orderBy: [{ room: { name: 'asc' } }, { tableNumber: 'asc' }],
    });

    const result = tables.map((t) => ({
      id: t.tableNumber,
      room: t.room.id,
      roomName: t.room.name,
      status: t.status,
      pax: t.pax,
      occupiedSince: t.occupiedSince,
      customer: t.customer,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    return NextResponse.json({ error: 'Napaka pri pridobivanju miz' }, { status: 500 });
  }
}

// POST /api/tables — create a new table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableNumber, roomId, pax } = body;

    if (typeof tableNumber !== 'number' || tableNumber < 1) {
      return NextResponse.json({ error: 'Številka mize je obvezna' }, { status: 400 });
    }
    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json({ error: 'Prostor je obvezen' }, { status: 400 });
    }

    // Verify room exists
    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: 'Prostor ni najden' }, { status: 400 });
    }

    const table = await db.table.create({
      data: {
        tableNumber,
        roomId,
        pax: pax || 0,
        status: 'free',
      },
      include: { room: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ data: table }, { status: 201 });
  } catch (error) {
    console.error('Failed to create table:', error);
    return NextResponse.json({ error: 'Napaka pri ustvarjanju mize' }, { status: 500 });
  }
}
