import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tables/[id] — get single table
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableNumber = parseInt(id);

    const table = await db.table.findUnique({
      where: { tableNumber },
      include: { room: { select: { id: true, name: true } } },
    });

    if (!table) {
      return NextResponse.json({ error: 'Miza ni najdena' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: table.tableNumber,
        room: table.room.id,
        roomName: table.room.name,
        status: table.status,
        pax: table.pax,
        occupiedSince: table.occupiedSince,
        customer: table.customer,
      },
    });
  } catch (error) {
    console.error('Failed to fetch table:', error);
    return NextResponse.json({ error: 'Napaka pri pridobivanju mize' }, { status: 500 });
  }
}

// PUT /api/tables/[id] — update table
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableNumber = parseInt(id);
    const body = await request.json();

    const table = await db.table.update({
      where: { tableNumber },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.pax !== undefined && { pax: body.pax }),
        ...(body.occupiedSince !== undefined && { occupiedSince: body.occupiedSince }),
        ...(body.customer !== undefined && { customer: body.customer }),
        ...(body.roomId && { roomId: body.roomId }),
      },
      include: { room: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ data: table });
  } catch (error) {
    console.error('Failed to update table:', error);
    return NextResponse.json({ error: 'Napaka pri posodabljanju mize' }, { status: 500 });
  }
}

// DELETE /api/tables/[id] — delete table
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableNumber = parseInt(id);
    await db.table.delete({ where: { tableNumber } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete table:', error);
    return NextResponse.json({ error: 'Napaka pri brisanju mize' }, { status: 500 });
  }
}

// PATCH /api/tables/[id] — update table status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableNumber = parseInt(id);
    const { status, customer, pax, occupiedSince } = await request.json();

    const validStatuses = ['free', 'occupied', 'attention', 'active'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Neveljaven status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (customer !== undefined) updateData.customer = customer;
    if (pax !== undefined) updateData.pax = pax;
    if (occupiedSince !== undefined) updateData.occupiedSince = occupiedSince;

    // When freeing a table, clear customer and occupiedSince
    if (status === 'free') {
      updateData.customer = null;
      updateData.occupiedSince = null;
      updateData.pax = 0;
    }

    const table = await db.table.update({
      where: { tableNumber },
      data: updateData,
      include: { room: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ data: table });
  } catch (error) {
    console.error('Failed to update table status:', error);
    return NextResponse.json({ error: 'Napaka pri posodabljanju statusa mize' }, { status: 500 });
  }
}
