import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders/[id] — get single order
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Naročilo ni najdeno' }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Napaka pri pridobivanju naročila' }, { status: 500 });
  }
}

// PUT /api/orders/[id] — update order (status, type, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const order = await db.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.type && { type: body.type }),
        ...(body.customer && { customer: body.customer }),
        ...(body.table !== undefined && { table: body.table }),
        ...(body.cashier && { cashier: body.cashier }),
        ...(body.total !== undefined && { total: body.total }),
      },
      include: { items: true },
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Napaka pri posodabljanju naročila' }, { status: 500 });
  }
}

// DELETE /api/orders/[id] — delete order
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json({ error: 'Napaka pri brisanju naročila' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — update order status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status je obvezen' }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Neveljaven status' }, { status: 400 });
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Napaka pri posodabljanju statusa' }, { status: 500 });
  }
}
