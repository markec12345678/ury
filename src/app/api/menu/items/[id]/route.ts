import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/menu/items/[id] — update a menu item
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const { name, nameLocal, price, description, isVeg, isAvailable, image, tags, modifiers, course } = body;

    const existing = await db.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Artikel ni najden' }, { status: 404 });
    }

    // If changing category, verify it exists
    if (course && course !== existing.categoryId) {
      const category = await db.menuCategory.findUnique({ where: { id: course } });
      if (!category) {
        return NextResponse.json({ error: 'Kategorija ni najdena' }, { status: 400 });
      }
    }

    const item = await db.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(nameLocal !== undefined && { nameLocal: nameLocal?.trim() || null }),
        ...(price !== undefined && { price }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isVeg !== undefined && { isVeg }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(image !== undefined && { image: image || null }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(modifiers !== undefined && { modifiers: modifiers ? JSON.stringify(modifiers) : null }),
        ...(course !== undefined && { categoryId: course }),
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      data: {
        id: item.id,
        name: item.name,
        nameLocal: item.nameLocal,
        price: item.price,
        description: item.description,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        image: item.image,
        tags: item.tags ? JSON.parse(item.tags) : [],
        modifiers: item.modifiers ? JSON.parse(item.modifiers) : [],
        course: item.categoryId,
        courseName: item.category.name,
      },
    });
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/menu/items/[id] — delete a menu item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Artikel ni najden' }, { status: 404 });
    }

    await db.menuItem.delete({ where: { id } });

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

// PATCH /api/menu/items/[id] — toggle availability
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Artikel ni najden' }, { status: 404 });
    }

    const item = await db.menuItem.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      data: {
        id: item.id,
        isAvailable: item.isAvailable,
      },
    });
  } catch (error) {
    console.error('Failed to toggle item availability:', error);
    return NextResponse.json({ error: 'Failed to toggle availability' }, { status: 500 });
  }
}
