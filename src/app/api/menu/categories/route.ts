import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/menu/categories — list all categories with item counts
export async function GET() {
  try {
    const categories = await db.menuCategory.findMany({
      orderBy: { priority: 'asc' },
      include: { _count: { select: { items: true } } },
    });

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      priority: c.priority,
      itemCount: c._count.items,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to fetch menu categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/menu/categories — create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, priority } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Ime kategorije je obvezno' }, { status: 400 });
    }

    const category = await db.menuCategory.create({
      data: {
        name: name.trim(),
        priority: typeof priority === 'number' ? priority : 0,
      },
    });

    return NextResponse.json({ data: { ...category, itemCount: 0 } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
