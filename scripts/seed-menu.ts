import { db } from '../src/lib/db';

async function seed() {
  console.log('🌱 Seeding database with Slovenian menu, rooms, tables, and orders...');

  // ── Create categories ────────────────────────────────
  const categories = [
    { id: 'cat-predjedi', name: 'Predjedi', priority: 1 },
    { id: 'cat-juhe', name: 'Juhe', priority: 2 },
    { id: 'cat-glavne-jedi', name: 'Glavne jedi', priority: 3 },
    { id: 'cat-priloge', name: 'Priloge', priority: 4 },
    { id: 'cat-sladice', name: 'Sladice', priority: 5 },
    { id: 'cat-pijace', name: 'Pijače', priority: 6 },
    { id: 'cat-solatte', name: 'Solate', priority: 7 },
  ];

  for (const cat of categories) {
    await db.menuCategory.upsert({
      where: { id: cat.id },
      update: { name: cat.name, priority: cat.priority },
      create: { id: cat.id, name: cat.name, priority: cat.priority },
    });
    console.log(`  ✓ Kategorija: ${cat.name}`);
  }

  // ── Create menu items (Slovenian cuisine with EUR prices) ──
  const items = [
    // Predjedi
    { name: 'Praženi jurčki', price: 8.90, isVeg: true, category: 'cat-predjedi', description: 'Na žaru praženi jurčki s šetrajem in česnom', tags: ['popular', 'lokalno'] },
    { name: 'Štruklji v orehih', price: 7.50, isVeg: true, category: 'cat-predjedi', description: 'Tradicionalni štruklji z orehovim nadevom', tags: ['tradicionalno'] },
    { name: 'Pršut z melono', price: 9.90, isVeg: false, category: 'cat-predjedi', description: 'Istrski pršut z zrelo melono', tags: ['premium'] },
    { name: 'Kobaričica', price: 6.50, isVeg: false, category: 'cat-predjedi', description: 'Domača salama s hrenom', tags: ['lokalno'] },
    { name: 'Kruh s svinjsko mastjo', price: 4.90, isVeg: false, category: 'cat-predjedi', description: 'Topel domač kruh s svinjsko mastjo in soljo', tags: ['tradicionalno'] },

    // Juhe
    { name: 'Gobova juha', price: 5.90, isVeg: true, category: 'cat-juhe', description: 'Kremna juha iz gozdov z belimi gobami', tags: ['sezonsko'] },
    { name: 'Govena juha', price: 6.50, isVeg: false, category: 'cat-juhe', description: 'Bogata goveja juha z rezanci in zelenjavo', tags: ['popular'] },
    { name: 'Pusta juha', price: 5.50, isVeg: true, category: 'cat-juhe', description: 'Tradicionalna fasting juha s krompirjem' },

    // Glavne jedi
    { name: 'Ocvrti piščanec', price: 12.90, isVeg: false, category: 'cat-glavne-jedi', description: 'Hrustljavo ocvrt piščanec s krompirjevo solato', tags: ['popular', 'tradicionalno'] },
    { name: 'Dunajski zrezek', price: 14.90, isVeg: false, category: 'cat-glavne-jedi', description: 'Paniran telečji zrezek s krompirjevo solato', tags: ['bestseller'] },
    { name: 'Kranjska klobasa', price: 11.50, isVeg: false, category: 'cat-glavne-jedi', description: 'Kranjska klobasa s kislim zeljem in krompirjem', tags: ['tradicionalno', 'popular'] },
    { name: 'Bograč', price: 13.50, isVeg: false, category: 'cat-glavne-jedi', description: 'Prekmurski bograč — bogata enolončnica z mesom', tags: ['tradicionalno', 'lokalno'] },
    { name: 'Ribja pečenka', price: 15.90, isVeg: false, category: 'cat-glavne-jedi', description: 'Pečena postrv z limono in zelišči', tags: ['premium'] },
    { name: 'Ajdovi žganci', price: 8.90, isVeg: true, category: 'cat-glavne-jedi', description: 'Ajdovi žganci z ocvirki in kislim mlekom', tags: ['tradicionalno'] },
    { name: 'Rižota z jurčki', price: 11.90, isVeg: true, category: 'cat-glavne-jedi', description: 'Kremna rižota z jurčki in parmezanom', tags: ['sezonsko'] },
    { name: 'Čevapčiči', price: 10.90, isVeg: false, category: 'cat-glavne-jedi', description: 'Mleti čevapčiči s puričem in ajvarjem', tags: ['popular'] },
    { name: 'Palačinke (sladke)', price: 7.90, isVeg: true, category: 'cat-glavne-jedi', description: 'Palačinke z marmelado ali Nutello', tags: ['otroško'] },

    // Priloge
    { name: 'Krompirjeva solata', price: 4.50, isVeg: true, category: 'cat-priloge', description: 'Domača krompirjeva solata' },
    { name: 'Kislo zelje', price: 3.90, isVeg: true, category: 'cat-priloge', description: 'Tradicionalno kislo zelje' },
    { name: 'Purič', price: 3.50, isVeg: true, category: 'cat-priloge', description: 'Pečen kruh v listih' },
    { name: 'Žemljice', price: 2.90, isVeg: true, category: 'cat-priloge', description: 'Mehke kuhane žemljice' },
    { name: 'Ocvirki', price: 3.50, isVeg: false, category: 'cat-priloge', description: 'Hrustljavi svinjski ocvirki' },

    // Solate
    { name: 'Mešana solata', price: 5.50, isVeg: true, category: 'cat-solatte', description: 'Sveža mešana solata s prelivom' },
    { name: 'Šopska solata', price: 6.90, isVeg: true, category: 'cat-solatte', description: 'Paradižnik, paprika, čebula in sir', tags: ['popular'] },
    { name: 'Solata s tuno', price: 8.50, isVeg: false, category: 'cat-solatte', description: 'Zelena solata s tuno in jajcem' },

    // Sladice
    { name: 'Prekmurska gibanica', price: 6.50, isVeg: true, category: 'cat-sladice', description: 'Tradicionalna prekmurska gibanica z orehi in skuto', tags: ['tradicionalno', 'bestseller'] },
    { name: 'Kremšnita', price: 5.90, isVeg: true, category: 'cat-sladice', description: 'Bledska kremšnita — listnato testo z vanilijevo kremo', tags: ['popular'] },
    { name: 'Pohorski lonec', price: 6.90, isVeg: true, category: 'cat-sladice', description: 'Čokoladna in orehova plast', tags: ['tradicionalno'] },
    { name: 'Štrudel z jabolki', price: 5.50, isVeg: true, category: 'cat-sladice', description: 'Jabolčni štrudel s cimetom', tags: ['popular'] },
    { name: 'Panna cotta', price: 5.90, isVeg: true, category: 'cat-sladice', description: 'Vanilijeva panna cotta z jagodnim prelivom' },

    // Pijače
    { name: 'Lasko pivo (0.5L)', price: 3.50, isVeg: true, category: 'cat-pijace', description: 'Laško pivo — slovenski klasik', tags: ['pivo'] },
    { name: 'Union pivo (0.5L)', price: 3.50, isVeg: true, category: 'cat-pijace', description: 'Union pivo iz Ljubljane', tags: ['pivo'] },
    { name: 'Rdeče vino (2dl)', price: 4.50, isVeg: true, category: 'cat-pijace', description: 'Domače rdeče vino', tags: ['vino'] },
    { name: 'Belo vino (2dl)', price: 4.50, isVeg: true, category: 'cat-pijace', description: 'Domače belo vino', tags: ['vino'] },
    { name: 'Kava', price: 2.20, isVeg: true, category: 'cat-pijace', description: 'Turška ali espresso kava', tags: ['popular'] },
    { name: 'Cedevita', price: 2.50, isVeg: true, category: 'cat-pijace', description: 'Vitaminsko sadno pijačo', tags: ['brezalkoholno'] },
    { name: 'Sok (0.2L)', price: 2.80, isVeg: true, category: 'cat-pijace', description: 'Naravni sadni sok', tags: ['brezalkoholno'] },
    { name: 'Radenska (0.5L)', price: 2.50, isVeg: true, category: 'cat-pijace', description: 'Radenska mineralna voda', tags: ['brezalkoholno'] },
  ];

  for (const item of items) {
    const id = `mi-${item.name.toLowerCase().replace(/[^a-z0-9čšž]+/g, '-').replace(/-+$/, '')}`;
    await db.menuItem.upsert({
      where: { id },
      update: {
        name: item.name,
        price: item.price,
        description: item.description || null,
        isVeg: item.isVeg,
        tags: item.tags ? JSON.stringify(item.tags) : null,
      },
      create: {
        id,
        name: item.name,
        price: item.price,
        description: item.description || null,
        isVeg: item.isVeg,
        isAvailable: true,
        tags: item.tags ? JSON.stringify(item.tags) : null,
        categoryId: item.category,
      },
    });
  }
  console.log(`  ✓ ${items.length} artiklov`);

  // ── Create rooms ─────────────────────────────────────
  const rooms = [
    { id: 'room-glavna', name: 'Glavna dvorana' },
    { id: 'room-terasa', name: 'Terasa' },
    { id: 'room-vip', name: 'VIP salon' },
    { id: 'room-bar', name: 'Bar' },
  ];

  for (const room of rooms) {
    await db.room.upsert({
      where: { id: room.id },
      update: { name: room.name },
      create: { id: room.id, name: room.name },
    });
  }
  console.log(`  ✓ ${rooms.length} prostorov`);

  // ── Create tables ────────────────────────────────────
  const tableDefs = [
    // Glavna dvorana: 16 tables
    ...Array.from({ length: 16 }, (_, i) => ({ number: i + 1, room: 'room-glavna' })),
    // Terasa: 8 tables
    ...Array.from({ length: 8 }, (_, i) => ({ number: i + 17, room: 'room-terasa' })),
    // VIP: 4 tables
    ...Array.from({ length: 4 }, (_, i) => ({ number: i + 25, room: 'room-vip' })),
    // Bar: 4 tables
    ...Array.from({ length: 4 }, (_, i) => ({ number: i + 29, room: 'room-bar' })),
  ];

  for (const t of tableDefs) {
    await db.table.upsert({
      where: { tableNumber: t.number },
      update: { roomId: t.room },
      create: { tableNumber: t.number, roomId: t.room, status: 'free', pax: 0 },
    });
  }

  // Set some tables as occupied for demo
  const occupiedTables = [
    { number: 1, pax: 4, customer: 'Ana Novak', since: '45' },
    { number: 3, pax: 2, customer: 'Marko Kovač', since: '30' },
    { number: 5, pax: 6, customer: 'Maja Zupan', since: '60' },
    { number: 8, pax: 3, customer: 'Luka Horvat', since: '20' },
    { number: 10, pax: 4, customer: 'Petra Krajnc', since: '50' },
    { number: 15, pax: 2, customer: 'Dejan Kovačević', since: '35' },
    { number: 17, pax: 4, customer: 'Nataša Potočnik', since: '25' },
    { number: 20, pax: 2, customer: 'Bojan Mlakar', since: '40' },
    { number: 25, pax: 8, customer: 'Žiga Vidmar', since: '70' },
    { number: 27, pax: 4, customer: 'Katarina Pečar', since: '55' },
  ];

  for (const t of occupiedTables) {
    await db.table.update({
      where: { tableNumber: t.number },
      data: { status: 'occupied', pax: t.pax, customer: t.customer, occupiedSince: t.since },
    });
  }
  console.log(`  ✓ ${tableDefs.length} miz (${occupiedTables.length} zasedenih)`);

  // ── Create sample orders ─────────────────────────────
  const orders = [
    {
      invoiceNo: 'INV-2026-0201', customer: 'Ana Novak', type: 'Dine-in', table: 'Miza 1',
      status: 'preparing', total: 36.70, cashier: 'Jan Oblak',
      items: [
        { name: 'Praženi jurčki', qty: 1, price: 8.90, course: 'Predjedi', status: 'ready' },
        { name: 'Ocvrti piščanec', qty: 2, price: 12.90, course: 'Glavne jedi', status: 'preparing' },
        { name: 'Krompirjeva solata', qty: 2, price: 4.50, course: 'Priloge', status: 'ready' },
        { name: 'Lasko pivo (0.5L)', qty: 2, price: 3.50, course: 'Pijače', status: 'ready' },
      ],
    },
    {
      invoiceNo: 'INV-2026-0202', customer: 'Marko Kovač', type: 'Dine-in', table: 'Miza 3',
      status: 'confirmed', total: 25.30, cashier: 'Jan Oblak',
      items: [
        { name: 'Gobova juha', qty: 2, price: 5.90, course: 'Juhe', status: 'preparing' },
        { name: 'Kranjska klobasa', qty: 1, price: 11.50, course: 'Glavne jedi', status: 'pending' },
        { name: 'Rdeče vino (2dl)', qty: 1, price: 4.50, course: 'Pijače', status: 'ready' },
      ],
    },
    {
      invoiceNo: 'INV-2026-0203', customer: 'Maja Zupan', type: 'Dine-in', table: 'Miza 5',
      status: 'pending', total: 94.30, cashier: 'Maja Sever',
      items: [
        { name: 'Pršut z melono', qty: 2, price: 9.90, course: 'Predjedi', status: 'pending' },
        { name: 'Bograč', qty: 3, price: 13.50, course: 'Glavne jedi', status: 'pending' },
        { name: 'Rižota z jurčki', qty: 2, price: 11.90, course: 'Glavne jedi', status: 'pending' },
        { name: 'Kremšnita', qty: 3, price: 5.90, course: 'Sladice', status: 'pending' },
        { name: 'Rdeče vino (2dl)', qty: 2, price: 4.50, course: 'Pijače', status: 'pending' },
      ],
    },
    {
      invoiceNo: 'INV-2026-0204', customer: 'Petra Krajnc', type: 'Takeaway', table: null,
      status: 'preparing', total: 18.80, cashier: 'Jan Oblak',
      items: [
        { name: 'Dunajski zrezek', qty: 1, price: 14.90, course: 'Glavne jedi', status: 'preparing' },
        { name: 'Kava', qty: 2, price: 2.20, course: 'Pijače', status: 'ready' },
      ],
    },
    {
      invoiceNo: 'INV-2026-0205', customer: 'Dejan Kovačević', type: 'Dine-in', table: 'Miza 15',
      status: 'ready', total: 22.40, cashier: 'Maja Sever',
      items: [
        { name: 'Čevapčiči', qty: 1, price: 10.90, course: 'Glavne jedi', status: 'ready' },
        { name: 'Šopska solata', qty: 1, price: 6.90, course: 'Solate', status: 'ready' },
        { name: 'Union pivo (0.5L)', qty: 1, price: 3.50, course: 'Pijače', status: 'ready' },
      ],
    },
    {
      invoiceNo: 'INV-2026-0206', customer: 'Nataša Potočnik', type: 'Delivery', table: null,
      status: 'confirmed', total: 31.20, cashier: 'Jan Oblak',
      items: [
        { name: 'Govena juha', qty: 2, price: 6.50, course: 'Juhe', status: 'preparing' },
        { name: 'Ocvrti piščanec', qty: 1, price: 12.90, course: 'Glavne jedi', status: 'pending' },
        { name: 'Prekmurska gibanica', qty: 1, price: 6.50, course: 'Sladice', status: 'pending' },
      ],
    },
  ];

  for (const order of orders) {
    await db.order.upsert({
      where: { invoiceNo: order.invoiceNo },
      update: {},
      create: {
        invoiceNo: order.invoiceNo,
        customer: order.customer,
        type: order.type,
        table: order.table,
        status: order.status,
        total: order.total,
        cashier: order.cashier,
        items: {
          create: order.items,
        },
      },
    });
  }
  console.log(`  ✓ ${orders.length} naročil`);

  console.log('\n✅ Seeding complete! Database is ready.');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
