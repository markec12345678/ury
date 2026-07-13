import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/menu/categories/[id] — update a category
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const { name, priority } = body;

    const existing = await db.menuCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Kategorija ni najdena' }, { status: 404 });
    }

    const category = await db.menuCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(priority !== undefined && { priority }),
      },
    });

    const itemCnt = await db.menuItem.count({ where: { categoryId: id } });

    return NextResponse.json({ data: { ...category, itemCount: itemCnt } });
  } catch (error) {
    console.error('Failed to update menu category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/menu/categories/[id] — delete a category (only if no items)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.menuCategory.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategorija ni najdena' }, { status: 404 });
    }

    if (existing._count.items > 0) {
      return NextResponse.json({
        error: `Kategorija vsebuje ${existing._count.items} artiklov. Najprej premaknite ali izbrišite artikle.`,
      }, { status: 409 });
    }

    await db.menuCategory.delete({ where: { id } });

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    console.error('Failed to delete menu category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
