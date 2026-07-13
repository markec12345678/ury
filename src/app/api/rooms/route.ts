import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rooms — list all rooms with table counts
export async function GET() {
  try {
    const rooms = await db.room.findMany({
      include: { _count: { select: { tables: true } } },
      orderBy: { name: 'asc' },
    });

    const result = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      tables: r._count.tables,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json({ error: 'Napaka pri pridobivanju prostorov' }, { status: 500 });
  }
}
