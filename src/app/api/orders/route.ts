import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders — list all orders with items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { items: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: { total, limit, offset },
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Napaka pri pridobivanju naročil' }, { status: 500 });
  }
}

// POST /api/orders — create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNo, table, customer, type, items, cashier } = body;

    if (!customer || typeof customer !== 'string' || customer.trim().length === 0) {
      return NextResponse.json({ error: 'Stranka je obvezna' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Naročilo mora vsebovati vsaj en artikel' }, { status: 400 });
    }

    // Calculate total
    const total = items.reduce((sum: number, item: { price: number; qty: number }) => sum + (item.price * item.qty), 0);

    // Generate invoice number if not provided
    const finalInvoiceNo = invoiceNo || `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const order = await db.order.create({
      data: {
        invoiceNo: finalInvoiceNo,
        table: table || null,
        customer: customer.trim(),
        type: type || 'Dine-in',
        status: 'pending',
        total,
        cashier: cashier || null,
        items: {
          create: items.map((item: { name: string; qty?: number; price: number; course?: string; comments?: string }) => ({
            name: item.name,
            qty: item.qty || 1,
            price: item.price,
            course: item.course || null,
            comments: item.comments || null,
            status: 'pending',
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Napaka pri ustvarjanju naročila' }, { status: 500 });
  }
}
