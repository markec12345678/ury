import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/menu/items — list all menu items (with category info)
export async function GET() {
  try {
    const items = await db.menuItem.findMany({
      orderBy: [{ category: { priority: 'asc' } }, { name: 'asc' }],
      include: { category: { select: { id: true, name: true, priority: true } } },
    });

    const result = items.map((item) => ({
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
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST /api/menu/items — create a new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameLocal, price, description, isVeg, isAvailable, image, tags, modifiers, course } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Ime artikla je obvezno' }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Cena mora biti pozitivno število' }, { status: 400 });
    }
    if (!course || typeof course !== 'string') {
      return NextResponse.json({ error: 'Kategorija je obvezna' }, { status: 400 });
    }

    // Verify category exists
    const category = await db.menuCategory.findUnique({ where: { id: course } });
    if (!category) {
      return NextResponse.json({ error: 'Kategorija ni najdena' }, { status: 400 });
    }

    const item = await db.menuItem.create({
      data: {
        name: name.trim(),
        nameLocal: nameLocal?.trim() || null,
        price,
        description: description?.trim() || null,
        isVeg: isVeg ?? true,
        isAvailable: isAvailable ?? true,
        image: image || null,
        tags: tags ? JSON.stringify(tags) : null,
        modifiers: modifiers ? JSON.stringify(modifiers) : null,
        categoryId: course,
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
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
