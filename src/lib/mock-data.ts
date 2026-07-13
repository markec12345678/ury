// URY Restaurant Management Evaluation Dashboard - Mock Data
// Restaurant: Spice Garden (Indian Restaurant)

export type {
  OrderStatus,
  OrderType,
  RecentOrder,
  TableStatus,
  TableData,
  KOTStatus,
  ProductionUnit,
  KOTItem,
  KOTCard,
  CashierData,
  ShiftInfo,
  APIEndpoint,
  KPIs,
  HourlySales,
  PLSummary,
  DailyPL,
  ExpenseBreakdown,
  PLLineItem,
  Room,
  FrontendApp,
  BackendComponent,
  InfrastructureComponent,
  DocEventHook,
} from '@/lib/ury-types';

// Re-export types for backward compatibility
import type {
  RecentOrder,
  TableData,
  KOTStatus,
  ProductionUnit,
  KOTItem,
  KOTCard,
  CashierData,
  ShiftInfo,
  APIEndpoint,
  HourlySales,
  ExpenseBreakdown,
  PLLineItem,
} from '@/lib/ury-types';

export const RESTAURANT_NAME = "Gostilna Pri Anici";
export const CURRENCY = "€";

// ── Tab 1: Overview ──────────────────────────────────────

export const kpiData = {
  dailySales: 2847,
  totalOrders: 87,
  avgBill: 32.70,
  occupiedTables: 10,
  totalTables: 32,
};

export const hourlySalesData = [
  { hour: "11:00", dineIn: 120, takeaway: 40 },
  { hour: "12:00", dineIn: 280, takeaway: 105 },
  { hour: "13:00", dineIn: 445, takeaway: 170 },
  { hour: "14:00", dineIn: 360, takeaway: 140 },
  { hour: "15:00", dineIn: 170, takeaway: 60 },
  { hour: "16:00", dineIn: 90, takeaway: 30 },
  { hour: "17:00", dineIn: 110, takeaway: 45 },
  { hour: "18:00", dineIn: 305, takeaway: 125 },
  { hour: "19:00", dineIn: 490, takeaway: 210 },
  { hour: "20:00", dineIn: 560, takeaway: 255 },
  { hour: "21:00", dineIn: 420, takeaway: 190 },
  { hour: "22:00", dineIn: 230, takeaway: 95 },
];

// Types moved to ury-types.ts — re-exported above

export const recentOrders: RecentOrder[] = [
  { invoice: "INV-2026-0201", customer: "Ana Novak", type: "Dine-in", amount: 36.70, status: "Paid", time: "21:42" },
  { invoice: "INV-2026-0202", customer: "Marko Kovač", type: "Takeaway", amount: 25.30, status: "Paid", time: "21:38" },
  { invoice: "INV-2026-0203", customer: "Maja Zupan", type: "Dine-in", amount: 94.30, status: "Draft", time: "21:35" },
  { invoice: "INV-2026-0204", customer: "Luka Horvat", type: "Delivery", amount: 18.80, status: "Paid", time: "21:28" },
  { invoice: "INV-2026-0205", customer: "Petra Krajnc", type: "Dine-in", amount: 22.40, status: "Draft", time: "21:22" },
  { invoice: "INV-2026-0206", customer: "Dejan Kovačević", type: "Takeaway", amount: 31.20, status: "Paid", time: "21:15" },
  { invoice: "INV-2026-0207", customer: "Nataša Potočnik", type: "Dine-in", amount: 67.90, status: "Paid", time: "21:08" },
  { invoice: "INV-2026-0208", customer: "Bojan Mlakar", type: "Delivery", amount: 15.40, status: "Cancelled", time: "21:02" },
];

// ── Tab 2: Tables ────────────────────────────────────────

// TableData type moved to ury-types.ts

export const rooms = [
  { id: "glavna", name: "Glavna dvorana", tables: 16 },
  { id: "terasa", name: "Terasa", tables: 8 },
  { id: "vip", name: "VIP", tables: 4 },
  { id: "bar", name: "Bar", tables: 4 },
];

export const tablesData: TableData[] = [
  // Glavna dvorana (16 tables)
  { id: 1, room: "glavna", status: "occupied", pax: 4, occupiedSince: "45", customer: "Ana Novak", orderItems: ["Ocvrti piščanec x2", "Krompirjeva solata x2", "Laško pivo x2"], orderTotal: 36.70 },
  { id: 2, room: "glavna", status: "free", pax: 0 },
  { id: 3, room: "glavna", status: "occupied", pax: 2, occupiedSince: "20", customer: "Marko Kovač", orderItems: ["Govena juha x2", "Kranjska klobasa"], orderTotal: 25.30 },
  { id: 4, room: "glavna", status: "attention", pax: 6, occupiedSince: "55", customer: "Luka Horvat", orderItems: ["Bograč x3", "Kislo zelje x3"], orderTotal: 52.20 },
  { id: 5, room: "glavna", status: "free", pax: 0 },
  { id: 6, room: "glavna", status: "occupied", pax: 4, occupiedSince: "15", customer: "Maja Zupan", orderItems: ["Praženi jurčki x2", "Rižota z jurčki x2"], orderTotal: 41.60 },
  { id: 7, room: "glavna", status: "free", pax: 0 },
  { id: 8, room: "glavna", status: "occupied", pax: 3, occupiedSince: "30", customer: "Neha Gupta", orderItems: ["Ajdovi žganci", "Ocvirki", "Kislo mleko"], orderTotal: 15.90 },
  { id: 9, room: "glavna", status: "free", pax: 0 },
  { id: 10, room: "glavna", status: "occupied", pax: 2, occupiedSince: "10", customer: "Arjun Menon", orderItems: ["Dunajski zrezek", "Krompirjeva solata"], orderTotal: 19.40 },
  { id: 11, room: "glavna", status: "free", pax: 0 },
  { id: 12, room: "glavna", status: "attention", pax: 4, occupiedSince: "38", customer: "Petra Krajnc", orderItems: ["Čevapčiči x2", "Šopska solata x2", "Pivo x4"], orderTotal: 35.60 },
  { id: 13, room: "glavna", status: "occupied", pax: 2, occupiedSince: "25", customer: "Dejan Kovačević", orderItems: ["Kranjska klobasa", "Kislo zelje"], orderTotal: 15.40 },
  { id: 14, room: "glavna", status: "free", pax: 0 },
  { id: 15, room: "glavna", status: "occupied", pax: 5, occupiedSince: "35", customer: "Nataša Potočnik", orderItems: ["Bograč x2", "Ocvrti piščanec", "Krompirjeva solata x3"], orderTotal: 52.00 },
  { id: 16, room: "glavna", status: "free", pax: 0 },
  // Terasa (8 tables)
  { id: 17, room: "terasa", status: "occupied", pax: 4, occupiedSince: "22", customer: "Žiga Vidmar", orderItems: ["Pršut z melono x2", "Rdeče vino x2"], orderTotal: 28.80 },
  { id: 18, room: "terasa", status: "free", pax: 0 },
  { id: 19, room: "terasa", status: "occupied", pax: 2, occupiedSince: "18", customer: "Katarina Pečar", orderItems: ["Rižota z jurčki x2", "Kava x2"], orderTotal: 28.20 },
  { id: 20, room: "terasa", status: "attention", pax: 6, occupiedSince: "42", customer: "Bojan Mlakar", orderItems: ["Ocvrti piščanec x3", "Krompirjeva solata x3", "Pivo x6"], orderTotal: 62.10 },
  { id: 21, room: "terasa", status: "free", pax: 0 },
  { id: 22, room: "terasa", status: "occupied", pax: 3, occupiedSince: "12", customer: "Simona Oblak", orderItems: ["Štruklji v orehih x3"], orderTotal: 22.50 },
  { id: 23, room: "terasa", status: "free", pax: 0 },
  { id: 24, room: "terasa", status: "occupied", pax: 2, occupiedSince: "28", customer: "Matej Lesjak", orderItems: ["Ribja pečenka", "Belo vino"], orderTotal: 20.40 },
  // VIP (4 tables)
  { id: 25, room: "vip", status: "occupied", pax: 8, occupiedSince: "50", customer: "Podjetje d.o.o. — Srečanje", orderItems: ["Bograč x4", "Ocvrti piščanec x4", "Kremšnita x8", "Vino x4"], orderTotal: 145.60 },
  { id: 26, room: "vip", status: "occupied", pax: 6, occupiedSince: "32", customer: "Družina Zupan", orderItems: ["Dunajski zrezek x3", "Ocvrti piščanec x3", "Pivo x6"], orderTotal: 91.20 },
  { id: 27, room: "vip", status: "free", pax: 0 },
  { id: 28, room: "vip", status: "attention", pax: 4, occupiedSince: "60", customer: "G. Horvat", orderItems: ["Ribja pečenka x2", "Praženi jurčki x2", "Premium vino x2"], orderTotal: 59.60 },
  // Bar (4 tables)
  { id: 29, room: "bar", status: "occupied", pax: 2, occupiedSince: "15", customer: "Jan & Maja", orderItems: ["Kava x4", "Prekmurska gibanica x2"], orderTotal: 17.80 },
  { id: 30, room: "bar", status: "free", pax: 0 },
  { id: 31, room: "bar", status: "occupied", pax: 3, occupiedSince: "25", customer: "Tilen & prijatelji", orderItems: ["Pivo x6", "Kobaričica", "Šopska solata"], orderTotal: 26.90 },
  { id: 32, room: "bar", status: "free", pax: 0 },
];

// ── Tab 3: Kitchen / KOT ─────────────────────────────────

// KOT types moved to ury-types.ts

export const kotCards: KOTCard[] = [
  {
    id: "KOT-0247",
    orderNo: "#042",
    table: "M1",
    items: [
      { name: "Ocvrti piščanec", qty: 2, course: "Glavne jedi" },
      { name: "Krompirjeva solata", qty: 2, course: "Priloge" },
      { name: "Laško pivo", qty: 2, course: "Pijače" },
    ],
    timePlaced: "21:42",
    elapsed: 3,
    status: "new",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0246",
    orderNo: "#041",
    table: "M4",
    items: [
      { name: "Bograč", qty: 3, course: "Glavne jedi" },
      { name: "Kislo zelje", qty: 3, course: "Priloge" },
    ],
    timePlaced: "21:35",
    elapsed: 10,
    status: "preparing",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0245",
    orderNo: "#040",
    table: "M3",
    items: [
      { name: "Praženi jurčki", qty: 1, course: "Predjedi", comments: "Brez česna" },
      { name: "Kranjska klobasa", qty: 2, course: "Glavne jedi" },
    ],
    timePlaced: "21:38",
    elapsed: 7,
    status: "modified",
    production: "Kuhinja 2",
    kotType: "Order Modified",
  },
  {
    id: "KOT-0244",
    orderNo: "#039",
    table: "M17",
    items: [
      { name: "Pršut z melono", qty: 2, course: "Predjedi" },
      { name: "Rdeče vino", qty: 2, course: "Pijače" },
    ],
    timePlaced: "21:22",
    elapsed: 23,
    status: "ready",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0243",
    orderNo: "#038",
    table: "Naročilo",
    items: [
      { name: "Dunajski zrezek", qty: 3, course: "Glavne jedi" },
      { name: "Kava", qty: 3, course: "Pijače" },
    ],
    timePlaced: "21:28",
    elapsed: 17,
    status: "preparing",
    production: "Kuhinja 2",
    kotType: "New Order",
  },
  {
    id: "KOT-0242",
    orderNo: "#037",
    table: "M25",
    items: [
      { name: "Bograč", qty: 4, course: "Glavne jedi" },
      { name: "Kremšnita", qty: 8, course: "Sladice" },
    ],
    timePlaced: "21:15",
    elapsed: 30,
    status: "ready",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0241",
    orderNo: "#036",
    table: "M29",
    items: [
      { name: "Kava", qty: 4, course: "Pijače" },
      { name: "Prekmurska gibanica", qty: 2, course: "Sladice" },
    ],
    timePlaced: "21:35",
    elapsed: 10,
    status: "new",
    production: "Bar",
    kotType: "New Order",
  },
  {
    id: "KOT-0240",
    orderNo: "#035",
    table: "M6",
    items: [
      { name: "Ribja pečenka", qty: 1, course: "Glavne jedi" },
      { name: "Belo vino", qty: 1, course: "Pijače" },
    ],
    timePlaced: "21:08",
    elapsed: 37,
    status: "cancelled",
    production: "Kuhinja 1",
    kotType: "Partially cancelled",
  },
];

// ── Tab 4: P&L ───────────────────────────────────────────

export const plSummary = {
  grossSales: 2847,
  cogs: 1281,
  grossProfit: 1566,
  netProfit: 228,
};

export const dailyPLData = [
  { day: "Pon", revenue: 2450, costs: 1850 },
  { day: "Tor", revenue: 2780, costs: 2030 },
  { day: "Sre", revenue: 2240, costs: 1710 },
  { day: "Čet", revenue: 2630, costs: 1920 },
  { day: "Pet", revenue: 3320, costs: 2310 },
  { day: "Sob", revenue: 3630, costs: 2465 },
  { day: "Ned", revenue: 2847, costs: 2240 },
];

export const expenseBreakdown = [
  { name: "COGS", value: 45, color: "#ef4444" },
  { name: "Direktni stroški", value: 15, color: "#f97316" },
  { name: "Stroški zaposlenih", value: 20, color: "#eab308" },
  { name: "Neposredni stroški", value: 12, color: "#8b5cf6" },
  { name: "Neto dobiček", value: 8, color: "#10b981" },
];

export const plLineItems = [
  { label: "Bruto prodaja", value: 2847, bold: true },
  { label: "COGS", value: -1281, bold: false },
  { label: "Bruto dobiček", value: 1566, bold: true },
  { label: "Stroški zaposlenih", value: -570, bold: false },
  { label: "Direktni stroški", value: -427, bold: false },
  { label: "Neposredni stroški", value: -341, bold: false },
  { label: "Neto dobiček / Izguba", value: 228, bold: true },
];

// ── Tab 5: Shift / Cashier ───────────────────────────────

// CashierData & ShiftInfo types moved to ury-types.ts

export const mockShiftInfo: ShiftInfo = {
  status: 'open',
  openedAt: '09:00',
  closesAt: '23:00',
  openedBy: 'Jan Oblak',
  openingBalance: 500,
};

export const mockCashiers: CashierData[] = [
  {
    name: "Jan Oblak",
    role: "URY Blagajnik",
    openedAt: "09:00",
    status: "active",
    openingBalance: 200,
    currentTotal: 1420,
    cashPayments: 580,
    cardPayments: 520,
    upiPayments: 320,
    ordersProcessed: 47,
    room: "Glavna dvorana",
  },
  {
    name: "Maja Sever",
    role: "URY Blagajnik",
    openedAt: "09:00",
    status: "active",
    openingBalance: 150,
    currentTotal: 890,
    cashPayments: 380,
    cardPayments: 320,
    upiPayments: 190,
    ordersProcessed: 32,
    room: "Terasa",
  },
  {
    name: "Tomaž Pintar",
    role: "URY Vodja",
    openedAt: "08:30",
    status: "active",
    openingBalance: 150,
    currentTotal: 1680,
    cashPayments: 720,
    cardPayments: 640,
    upiPayments: 320,
    ordersProcessed: 34,
    room: "VIP + Bar",
  },
];

// ── Tab: Menu ───────────────────────────────────────────

export const menuCourses: import('@/lib/ury-types').MenuCourse[] = [
  { id: 'predjedi', name: 'Predjedi', priority: 1, itemCount: 5 },
  { id: 'juhe', name: 'Juhe', priority: 2, itemCount: 3 },
  { id: 'glavne-jedi', name: 'Glavne jedi', priority: 3, itemCount: 8 },
  { id: 'priloge', name: 'Priloge', priority: 4, itemCount: 5 },
  { id: 'solate', name: 'Solate', priority: 5, itemCount: 3 },
  { id: 'sladice', name: 'Sladice', priority: 6, itemCount: 4 },
  { id: 'pijace', name: 'Pijače', priority: 7, itemCount: 8 },
];

export const menuItems: import('@/lib/ury-types').MenuItem[] = [
  // Predjedi
  { id: 'MI-001', name: 'Praženi jurčki', course: 'predjedi', courseName: 'Predjedi', price: 8.90, isVeg: true, isAvailable: true, description: 'Na žaru praženi jurčki s šetrajem in česnom', tags: ['popular', 'lokalno'] },
  { id: 'MI-002', name: 'Štruklji v orehih', course: 'predjedi', courseName: 'Predjedi', price: 7.50, isVeg: true, isAvailable: true, description: 'Tradicionalni štruklji z orehovim nadevom', tags: ['tradicionalno'] },
  { id: 'MI-003', name: 'Pršut z melono', course: 'predjedi', courseName: 'Predjedi', price: 9.90, isVeg: false, isAvailable: true, description: 'Istrski pršut z zrelo melono', tags: ['premium'] },
  { id: 'MI-004', name: 'Kobaričica', course: 'predjedi', courseName: 'Predjedi', price: 6.50, isVeg: false, isAvailable: true, description: 'Domača salama s hrenom', tags: ['lokalno'] },
  { id: 'MI-005', name: 'Kruh s svinjsko mastjo', course: 'predjedi', courseName: 'Predjedi', price: 4.90, isVeg: false, isAvailable: false, description: 'Topel domač kruh s svinjsko mastjo in soljo', tags: ['tradicionalno'] },
  // Juhe
  { id: 'MI-006', name: 'Gobova juha', course: 'juhe', courseName: 'Juhe', price: 5.90, isVeg: true, isAvailable: true, description: 'Kremna juha iz gozdov z belimi gobami', tags: ['sezonsko'] },
  { id: 'MI-007', name: 'Govena juha', course: 'juhe', courseName: 'Juhe', price: 6.50, isVeg: false, isAvailable: true, description: 'Bogata goveja juha z rezanci in zelenjavo', tags: ['popular'] },
  { id: 'MI-008', name: 'Pusta juha', course: 'juhe', courseName: 'Juhe', price: 5.50, isVeg: true, isAvailable: true, description: 'Tradicionalna fasting juha s krompirjem' },
  // Glavne jedi
  { id: 'MI-009', name: 'Ocvrti piščanec', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 12.90, isVeg: false, isAvailable: true, description: 'Hrustljavo ocvrt piščanec s krompirjevo solato', tags: ['popular', 'tradicionalno'] },
  { id: 'MI-010', name: 'Dunajski zrezek', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 14.90, isVeg: false, isAvailable: true, description: 'Paniran telečji zrezek s krompirjevo solato', tags: ['bestseller'] },
  { id: 'MI-011', name: 'Kranjska klobasa', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 11.50, isVeg: false, isAvailable: true, description: 'Kranjska klobasa s kislim zeljem in krompirjem', tags: ['tradicionalno', 'popular'] },
  { id: 'MI-012', name: 'Bograč', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 13.50, isVeg: false, isAvailable: true, description: 'Prekmurski bograč — bogata enolončnica z mesom', tags: ['tradicionalno', 'lokalno'] },
  { id: 'MI-013', name: 'Ribja pečenka', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 15.90, isVeg: false, isAvailable: true, description: 'Pečena postrv z limono in zelišči', tags: ['premium'] },
  { id: 'MI-014', name: 'Ajdovi žganci', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 8.90, isVeg: true, isAvailable: true, description: 'Ajdovi žganci z ocvirki in kislim mlekom', tags: ['tradicionalno'] },
  { id: 'MI-015', name: 'Rižota z jurčki', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 11.90, isVeg: true, isAvailable: true, description: 'Kremna rižota z jurčki in parmezanom', tags: ['sezonsko'] },
  { id: 'MI-016', name: 'Čevapčiči', course: 'glavne-jedi', courseName: 'Glavne jedi', price: 10.90, isVeg: false, isAvailable: true, description: 'Mleti čevapčiči s puričem in ajvarjem', tags: ['popular'] },
  // Priloge
  { id: 'MI-017', name: 'Krompirjeva solata', course: 'priloge', courseName: 'Priloge', price: 4.50, isVeg: true, isAvailable: true, description: 'Domača krompirjeva solata' },
  { id: 'MI-018', name: 'Kislo zelje', course: 'priloge', courseName: 'Priloge', price: 3.90, isVeg: true, isAvailable: true, description: 'Tradicionalno kislo zelje' },
  { id: 'MI-019', name: 'Purič', course: 'priloge', courseName: 'Priloge', price: 3.50, isVeg: true, isAvailable: true, description: 'Pečen kruh v listih' },
  { id: 'MI-020', name: 'Žemljice', course: 'priloge', courseName: 'Priloge', price: 2.90, isVeg: true, isAvailable: true, description: 'Mehke kuhane žemljice' },
  { id: 'MI-021', name: 'Ocvirki', course: 'priloge', courseName: 'Priloge', price: 3.50, isVeg: false, isAvailable: true, description: 'Hrustljavi svinjski ocvirki' },
  // Solate
  { id: 'MI-022', name: 'Mešana solata', course: 'solate', courseName: 'Solate', price: 5.50, isVeg: true, isAvailable: true, description: 'Sveža mešana solata s prelivom' },
  { id: 'MI-023', name: 'Šopska solata', course: 'solate', courseName: 'Solate', price: 6.90, isVeg: true, isAvailable: true, description: 'Paradižnik, paprika, čebula in sir', tags: ['popular'] },
  { id: 'MI-024', name: 'Solata s tuno', course: 'solate', courseName: 'Solate', price: 8.50, isVeg: false, isAvailable: true, description: 'Zelena solata s tuno in jajcem' },
  // Sladice
  { id: 'MI-025', name: 'Prekmurska gibanica', course: 'sladice', courseName: 'Sladice', price: 6.50, isVeg: true, isAvailable: true, description: 'Tradicionalna prekmurska gibanica z orehi in skuto', tags: ['tradicionalno', 'bestseller'] },
  { id: 'MI-026', name: 'Kremšnita', course: 'sladice', courseName: 'Sladice', price: 5.90, isVeg: true, isAvailable: true, description: 'Bledska kremšnita — listnato testo z vanilijevo kremo', tags: ['popular'] },
  { id: 'MI-027', name: 'Pohorski lonec', course: 'sladice', courseName: 'Sladice', price: 6.90, isVeg: true, isAvailable: true, description: 'Čokoladna in orehova plast', tags: ['tradicionalno'] },
  { id: 'MI-028', name: 'Štrudel z jabolki', course: 'sladice', courseName: 'Sladice', price: 5.50, isVeg: true, isAvailable: false, description: 'Jabolčni štrudel s cimetom', tags: ['popular'] },
  // Pijače
  { id: 'MI-029', name: 'Laško pivo (0.5L)', course: 'pijace', courseName: 'Pijače', price: 3.50, isVeg: true, isAvailable: true, description: 'Laško pivo — slovenski klasik', tags: ['pivo'] },
  { id: 'MI-030', name: 'Union pivo (0.5L)', course: 'pijace', courseName: 'Pijače', price: 3.50, isVeg: true, isAvailable: true, description: 'Union pivo iz Ljubljane', tags: ['pivo'] },
  { id: 'MI-031', name: 'Rdeče vino (2dl)', course: 'pijace', courseName: 'Pijače', price: 4.50, isVeg: true, isAvailable: true, description: 'Domače rdeče vino', tags: ['vino'] },
  { id: 'MI-032', name: 'Belo vino (2dl)', course: 'pijace', courseName: 'Pijače', price: 4.50, isVeg: true, isAvailable: true, description: 'Domače belo vino', tags: ['vino'] },
  { id: 'MI-033', name: 'Kava', course: 'pijace', courseName: 'Pijače', price: 2.20, isVeg: true, isAvailable: true, description: 'Turška ali espresso kava', tags: ['popular'] },
  { id: 'MI-034', name: 'Cedevita', course: 'pijace', courseName: 'Pijače', price: 2.50, isVeg: true, isAvailable: true, description: 'Vitaminsko sadno pijačo', tags: ['brezalkoholno'] },
  { id: 'MI-035', name: 'Sok (0.2L)', course: 'pijace', courseName: 'Pijače', price: 2.80, isVeg: true, isAvailable: true, description: 'Naravni sadni sok', tags: ['brezalkoholno'] },
  { id: 'MI-036', name: 'Radenska (0.5L)', course: 'pijace', courseName: 'Pijače', price: 2.50, isVeg: true, isAvailable: true, description: 'Radenska mineralna voda', tags: ['brezalkoholno'] },
];

// ── Tab: Active Orders ──────────────────────────────────

export const activeOrders: import('@/lib/ury-types').ActiveOrder[] = [
  {
    id: 'ORD-001', invoiceNo: 'INV-2026-0201', table: 'M1', customer: 'Ana Novak', type: 'Dine-in',
    items: [
      { name: 'Ocvrti piščanec', qty: 2, price: 12.90, course: 'Glavne jedi', status: 'preparing' },
      { name: 'Krompirjeva solata', qty: 2, price: 4.50, course: 'Priloge', status: 'ready' },
      { name: 'Laško pivo', qty: 2, price: 3.50, course: 'Pijače', status: 'ready' },
    ],
    status: 'preparing', total: 36.70, placedAt: '21:42', elapsed: 3, cashier: 'Jan Oblak',
  },
  {
    id: 'ORD-002', invoiceNo: 'INV-2026-0202', table: 'M3', customer: 'Marko Kovač', type: 'Takeaway',
    items: [
      { name: 'Govena juha', qty: 2, price: 6.50, course: 'Juhe', status: 'ready' },
      { name: 'Kranjska klobasa', qty: 1, price: 11.50, course: 'Glavne jedi', status: 'preparing' },
    ],
    status: 'confirmed', total: 25.30, placedAt: '21:38', elapsed: 7, cashier: 'Maja Sever',
  },
  {
    id: 'ORD-003', invoiceNo: 'INV-2026-0203', table: 'M5', customer: 'Maja Zupan', type: 'Dine-in',
    items: [
      { name: 'Pršut z melono', qty: 2, price: 9.90, course: 'Predjedi', status: 'preparing' },
      { name: 'Bograč', qty: 3, price: 13.50, course: 'Glavne jedi', status: 'pending' },
      { name: 'Rižota z jurčki', qty: 2, price: 11.90, course: 'Glavne jedi', status: 'pending' },
    ],
    status: 'preparing', total: 94.30, placedAt: '21:35', elapsed: 10, cashier: 'Jan Oblak',
  },
  {
    id: 'ORD-004', invoiceNo: 'INV-2026-0204', customer: 'Petra Krajnc', type: 'Delivery',
    items: [
      { name: 'Dunajski zrezek', qty: 1, price: 14.90, course: 'Glavne jedi', status: 'ready' },
      { name: 'Kava', qty: 2, price: 2.20, course: 'Pijače', status: 'ready' },
    ],
    status: 'ready', total: 18.80, placedAt: '21:28', elapsed: 17, cashier: 'Tomaž Pintar',
  },
  {
    id: 'ORD-005', invoiceNo: 'INV-2026-0205', table: 'M8', customer: 'Luka Horvat', type: 'Dine-in',
    items: [
      { name: 'Ajdovi žganci', qty: 1, price: 8.90, course: 'Glavne jedi', status: 'ready' },
      { name: 'Ocvirki', qty: 1, price: 3.50, course: 'Priloge', status: 'ready' },
    ],
    status: 'served', total: 15.90, placedAt: '21:22', elapsed: 23, cashier: 'Maja Sever',
  },
  {
    id: 'ORD-006', invoiceNo: 'INV-2026-0206', table: 'M10', customer: 'Dejan Kovačević', type: 'Dine-in',
    items: [
      { name: 'Čevapčiči', qty: 1, price: 10.90, course: 'Glavne jedi', status: 'preparing' },
      { name: 'Šopska solata', qty: 1, price: 6.90, course: 'Solate', status: 'pending' },
    ],
    status: 'confirmed', total: 22.40, placedAt: '21:08', elapsed: 37, cashier: 'Jan Oblak',
  },
  {
    id: 'ORD-007', invoiceNo: 'INV-2026-0207', table: 'M25', customer: 'Podjetje d.o.o.', type: 'Dine-in',
    items: [
      { name: 'Bograč', qty: 4, price: 13.50, course: 'Glavne jedi', status: 'preparing' },
      { name: 'Ocvrti piščanec', qty: 4, price: 12.90, course: 'Glavne jedi', status: 'ready' },
      { name: 'Kremšnita', qty: 8, price: 5.90, course: 'Sladice', status: 'pending' },
    ],
    status: 'preparing', total: 145.60, placedAt: '21:15', elapsed: 30, cashier: 'Tomaž Pintar',
  },
  {
    id: 'ORD-008', invoiceNo: 'INV-2026-0208', table: 'M29', customer: 'Nataša Potočnik', type: 'Dine-in',
    items: [
      { name: 'Kava', qty: 4, price: 2.20, course: 'Pijače', status: 'ready' },
      { name: 'Prekmurska gibanica', qty: 2, price: 6.50, course: 'Sladice', status: 'ready' },
    ],
    status: 'ready', total: 17.80, placedAt: '21:35', elapsed: 10, cashier: 'Tomaž Pintar',
  },
];

// ── Tab 6: API Explorer ──────────────────────────────────

// APIEndpoint type moved to ury-types.ts

export const apiEndpoints: APIEndpoint[] = [
  // POS API
  { method: "getRestaurantMenu", module: "ury_pos/api.py", httpMethod: "POST", parameters: "pos_profile, room?, order_type?", description: "Fetches restaurant menu items with images, rates, and courses based on POS profile, room, or order type", paramDetails: [{ name: "pos_profile", type: "string", required: true, description: "Name of the POS Profile" }, { name: "room", type: "string", required: false, description: "Room name for room-wise menu" }, { name: "order_type", type: "string", required: false, description: "Order type for type-wise menu" }], exampleResponse: '{ "items": [...], "modified_time": "2026-01-01 12:00:00", "name": "Spice Garden Menu" }' },
  { method: "getMenuCourses", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns all available menu courses (categories) from URY Menu Course doctype" },
  { method: "getBranch", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Gets the branch name associated with the current logged-in user via URY User mapping" },
  { method: "getBranchRoom", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns branch and room details for the current user" },
  { method: "getRoom", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns all rooms assigned to the current user across branches" },
  { method: "getModeOfPayment", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Fetches available modes of payment configured in the POS Profile" },
  { method: "getInvoiceForCashier", module: "ury_pos/api.py", httpMethod: "POST", parameters: "status, cashier, limit, limit_start", description: "Gets POS invoices filtered by status for a specific cashier with pagination", paramDetails: [{ name: "status", type: "string", required: true, description: "Draft / Unbilled / Recently Paid / Paid" }, { name: "cashier", type: "string", required: true, description: "Cashier user ID" }, { name: "limit", type: "int", required: true, description: "Page size" }, { name: "limit_start", type: "int", required: true, description: "Offset for pagination" }] },
  { method: "getPosInvoice", module: "ury_pos/api.py", httpMethod: "POST", parameters: "status, limit, limit_start", description: "Gets POS invoices filtered by status for the current branch with pagination" },
  { method: "searchPosInvoice", module: "ury_pos/api.py", httpMethod: "POST", parameters: "query, status", description: "Searches POS invoices by name, customer, or mobile number with status filter" },
  { method: "get_select_field_options", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns order type options from POS Invoice doctype metadata" },
  { method: "fav_items", module: "ury_pos/api.py", httpMethod: "POST", parameters: "customer", description: "Returns frequently ordered items for a specific customer based on past invoices", paramDetails: [{ name: "customer", type: "string", required: true, description: "Customer name" }] },
  { method: "getCashier", module: "ury_pos/api.py", httpMethod: "POST", parameters: "room", description: "Returns the cashier user assigned to a specific room from POS Opening Entry" },
  { method: "getPosProfile", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns full POS profile configuration including printer settings, cashier, QZ config, and feature flags" },
  { method: "getPosInvoiceItems", module: "ury_pos/api.py", httpMethod: "POST", parameters: "invoice", description: "Returns item details and tax breakdown for a specific POS Invoice" },
  { method: "posOpening", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Checks if a POS Opening Entry exists and is open for the current branch" },
  { method: "getAggregator", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns aggregator settings (Swiggy, Zomato etc.) configured for the branch" },
  { method: "getAggregatorItem", module: "ury_pos/api.py", httpMethod: "POST", parameters: "aggregator", description: "Returns menu items with prices for a specific aggregator's price list" },
  { method: "getAggregatorMOP", module: "ury_pos/api.py", httpMethod: "POST", parameters: "aggregator", description: "Returns mode of payment configured for a specific aggregator" },
  { method: "create_customer", module: "ury_pos/api.py", httpMethod: "POST", parameters: "customer_name, mobile_number, customer_group?, territory?", description: "Creates a new customer with phone validation", paramDetails: [{ name: "customer_name", type: "string", required: true, description: "Customer name" }, { name: "mobile_number", type: "string", required: true, description: "Valid mobile number" }, { name: "customer_group", type: "string", required: false, description: "Default: Individual" }, { name: "territory", type: "string", required: false, description: "Default: India" }] },
  { method: "validate_pos_close", module: "ury_pos/api.py", httpMethod: "POST", parameters: "pos_profile", description: "Validates if previous day's POS opening has been properly closed before allowing new operations" },
  // KOT API
  { method: "kot_execute", module: "ury/api/ury_kot_generate.py", httpMethod: "POST", parameters: "invoice_id, customer, restaurant_table?, current_items, previous_items, comments?", description: "Main KOT generation endpoint - compares current vs previous items, creates new/modified/cancel KOTs per production unit", paramDetails: [{ name: "invoice_id", type: "string", required: true, description: "POS Invoice ID" }, { name: "customer", type: "string", required: true, description: "Customer name" }, { name: "restaurant_table", type: "string", required: false, description: "Table ID" }, { name: "current_items", type: "JSON", required: true, description: "Current order items" }, { name: "previous_items", type: "JSON", required: true, description: "Previous order items for diff" }, { name: "comments", type: "string", required: false, description: "Order comments" }] },
  { method: "get_kot_list", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "none", description: "Returns active KOT list for KDS display with production unit filtering and order type support" },
  { method: "serve_kot", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "name, time", description: "Marks a KOT as served with production time tracking", paramDetails: [{ name: "name", type: "string", required: true, description: "KOT document name" }, { name: "time", type: "string", required: true, description: "Serve timestamp" }] },
  { method: "confirm_kot", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "name, user", description: "Confirms/verifies a cancelled KOT by an authorized user" },
  { method: "get_production_units", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "none", description: "Returns all production units for the current branch" },
  { method: "ury_kot_reprint", module: "ury/api/ury_kot_reprint.py", httpMethod: "POST", parameters: "invoice_number", description: "Reprints a KOT for a given invoice if enabled in POS Profile settings" },
  { method: "order_delay_notification", module: "ury/api/ury_kot_notification.py", httpMethod: "POST", parameters: "id", description: "Sends delay notification to configured recipients when a KOT exceeds the warning time threshold" },
  { method: "kotValidationThread", module: "ury/api/ury_kot_validation.py", httpMethod: "POST", parameters: "none", description: "Scheduled task (cron) that validates and auto-generates missing KOTs for invoices created in the last 5 minutes" },
  { method: "validate_priority", module: "ury/api/ury_menu_course_validation.py", httpMethod: "POST", parameters: "none", description: "Validates that serving priority is unique across menu courses" },
  { method: "cancel_check", module: "ury/api/button_permission.py", httpMethod: "POST", parameters: "none", description: "Checks if the current user has permission to cancel POS Invoices" },
  { method: "overrided_past_order_list", module: "ury/api/pos_extend.py", httpMethod: "POST", parameters: "search_term, status, limit?", description: "Overrides the default past order list with branch and room filtering for URY users" },
  // Print API
  { method: "network_printing", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "doctype, name, printer_setting, print_format?, doc?, no_letterhead?, file_path?", description: "Sends a document to a network printer via CUPS, handles invoice_printed and table status updates" },
  { method: "select_network_printer", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "pos_profile, invoice_id", description: "Selects the appropriate network printer (room-based or POS profile-based) for printing an invoice" },
  { method: "qz_print_update", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "invoice", description: "Updates invoice_printed status and table occupancy after QZ Tray printing" },
  { method: "print_pos_page", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "doctype, name, print_format", description: "Publishes print job via Frappe realtime (WebSocket) channel for browser-based printing" },
  { method: "qz_certificate", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "none", description: "Returns the QZ Tray certificate from site config for secure printing" },
  { method: "signature_promise", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "none", description: "Returns the QZ Tray private key from site config for signing print requests" },
];

// ── Tab 6: Architecture ──────────────────────────────────

export const frontendApps = [
  { name: "POS React", tech: "React + Vite", path: "ury/pos/", description: "Modern POS interface built with React, TypeScript, and Vite" },
  { name: "KOT Mosaic Vue", tech: "Vue 3 + Vite", path: "ury/URYMosaic/", description: "Kitchen Display System (KDS) built with Vue 3 for real-time KOT management" },
  { name: "POS v1 Vue", tech: "Vue 3 + Vite", path: "ury/urypos/", description: "Legacy POS interface built with Vue 3 for order management" },
];

export const backendComponents = [
  { name: "Frappe/ERPNext", description: "Core backend framework providing REST API, database ORM, authentication, and doctype management" },
];

export const infrastructureComponents = [
  { name: "MariaDB", description: "Primary database for all Frappe/ERPNext data" },
  { name: "Socket.io", description: "Real-time communication for KOT updates and print jobs" },
  { name: "QZ Tray", description: "Desktop utility for direct thermal printer communication" },
];

export const doctypes = [
  "URY Restaurant",
  "URY Room",
  "URY Table",
  "URY Menu",
  "URY Menu Item",
  "URY Menu Course",
  "URY Order",
  "URY Order Item",
  "URY KOT",
  "URY KOT Items",
  "URY KOT Error Log",
  "URY Production Unit",
  "URY Production Item Groups",
  "URY User",
  "URY Printer Settings",
  "URY Daily P&L",
  "URY P&L Breakup",
  "URY Cost of Goods",
  "URY Materials",
  "URY P&L Materials",
  "URY Fixed Expenses",
  "URY Variable Expenses",
  "URY Report Settings",
  "URY Notification Recipient",
  "Aggregator Settings",
  "Item Add On",
  "Menu for Room",
  "Multiple Rooms",
  "Order Type Menu",
  "POS Item Variants",
  "Role Permitted",
  "Sub POS Invoices",
  "Sub POS Closing",
  "Sub POS Closing Payment",
  "KDS Order Type",
];

export const docEventHooks = [
  { doctype: "POS Invoice", events: ["before_insert", "validate", "after_insert", "before_submit", "on_cancel", "on_trash"] },
  { doctype: "POS Profile", events: ["validate"] },
  { doctype: "Sales Invoice", events: ["before_insert", "on_update"] },
  { doctype: "Item", events: ["validate"] },
  { doctype: "POS Opening Entry", events: ["validate", "before_save", "before_insert"] },
  { doctype: "POS Closing Entry", events: ["before_save", "validate"] },
  { doctype: "URY Menu Course", events: ["validate"] },
];

// ── Advanced Dashboard Mock Data ────────────────────────

export const dashboardMetricsByPeriod: Record<string, import('@/lib/ury-types').DashboardMetrics> = {
  today: {
    totalRevenue: 124580,
    totalOrders: 187,
    avgOrderValue: 667,
    occupancyRate: 75,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    avgOrderGrowth: -2.1,
    occupancyGrowth: 5.2,
  },
  yesterday: {
    totalRevenue: 110740,
    totalOrders: 172,
    avgOrderValue: 644,
    occupancyRate: 70,
    revenueGrowth: -3.2,
    ordersGrowth: -1.5,
    avgOrderGrowth: -1.8,
    occupancyGrowth: -2.0,
  },
  week: {
    totalRevenue: 785600,
    totalOrders: 1243,
    avgOrderValue: 632,
    occupancyRate: 68,
    revenueGrowth: 9.8,
    ordersGrowth: 6.4,
    avgOrderGrowth: 3.1,
    occupancyGrowth: 4.7,
  },
  month: {
    totalRevenue: 3250000,
    totalOrders: 5180,
    avgOrderValue: 627,
    occupancyRate: 65,
    revenueGrowth: 15.3,
    ordersGrowth: 11.7,
    avgOrderGrowth: 2.9,
    occupancyGrowth: 7.1,
  },
  quarter: {
    totalRevenue: 9450000,
    totalOrders: 15200,
    avgOrderValue: 622,
    occupancyRate: 63,
    revenueGrowth: 18.6,
    ordersGrowth: 14.2,
    avgOrderGrowth: 3.5,
    occupancyGrowth: 8.4,
  },
};

export const salesTrendByPeriod: Record<string, import('@/lib/ury-types').SalesTrendPoint[]> = {
  today: [
    { label: '11:00', revenue: 3200, orders: 5 },
    { label: '12:00', revenue: 7700, orders: 12 },
    { label: '13:00', revenue: 12300, orders: 18 },
    { label: '14:00', revenue: 10000, orders: 15 },
    { label: '15:00', revenue: 4600, orders: 7 },
    { label: '16:00', revenue: 2400, orders: 4 },
    { label: '17:00', revenue: 3100, orders: 5 },
    { label: '18:00', revenue: 8600, orders: 14 },
    { label: '19:00', revenue: 14000, orders: 21 },
    { label: '20:00', revenue: 18000, orders: 26 },
    { label: '21:00', revenue: 15400, orders: 22 },
    { label: '22:00', revenue: 9200, orders: 14 },
    { label: '23:00', revenue: 5080, orders: 8 },
  ],
  yesterday: [
    { label: '11:00', revenue: 2800, orders: 4 },
    { label: '12:00', revenue: 6500, orders: 10 },
    { label: '13:00', revenue: 10800, orders: 16 },
    { label: '14:00', revenue: 9200, orders: 14 },
    { label: '15:00', revenue: 3900, orders: 6 },
    { label: '16:00', revenue: 2100, orders: 3 },
    { label: '17:00', revenue: 2700, orders: 4 },
    { label: '18:00', revenue: 7800, orders: 12 },
    { label: '19:00', revenue: 12600, orders: 19 },
    { label: '20:00', revenue: 16200, orders: 24 },
    { label: '21:00', revenue: 13800, orders: 20 },
    { label: '22:00', revenue: 8400, orders: 12 },
    { label: '23:00', revenue: 4700, orders: 7 },
  ],
  week: [
    { label: 'Pon', revenue: 112000, orders: 178 },
    { label: 'Tor', revenue: 98400, orders: 156 },
    { label: 'Sre', revenue: 124000, orders: 196 },
    { label: 'Čet', revenue: 105600, orders: 168 },
    { label: 'Pet', revenue: 142000, orders: 224 },
    { label: 'Sob', revenue: 128000, orders: 204 },
    { label: 'Ned', revenue: 75600, orders: 117 },
  ],
  month: [
    { label: 'Teden 1', revenue: 812000, orders: 1295 },
    { label: 'Teden 2', revenue: 785000, orders: 1243 },
    { label: 'Teden 3', revenue: 845000, orders: 1348 },
    { label: 'Teden 4', revenue: 808000, orders: 1294 },
  ],
  quarter: [
    { label: 'April', revenue: 3050000, orders: 4860 },
    { label: 'Maj', revenue: 3150000, orders: 5020 },
    { label: 'Junij', revenue: 3250000, orders: 5180 },
  ],
};

export const topSellingItems: import('@/lib/ury-types').TopSellingItem[] = [
  { id: 'mi-1', name: 'Butter Chicken', quantity: 47, revenue: 23500, course: 'main', isVeg: false },
  { id: 'mi-3', name: 'Paneer Tikka', quantity: 38, revenue: 15200, course: 'starters', isVeg: true },
  { id: 'mi-5', name: 'Dal Makhani', quantity: 34, revenue: 11900, course: 'main', isVeg: true },
  { id: 'mi-8', name: 'Chicken Biryani', quantity: 31, revenue: 18600, course: 'rice', isVeg: false },
  { id: 'mi-2', name: 'Chicken Tikka', quantity: 29, revenue: 14500, course: 'starters', isVeg: false },
  { id: 'mi-12', name: 'Naan', quantity: 86, revenue: 8600, course: 'bread', isVeg: true },
  { id: 'mi-10', name: 'Gulab Jamun', quantity: 24, revenue: 4800, course: 'desserts', isVeg: true },
  { id: 'mi-7', name: 'Veg Fried Rice', quantity: 22, revenue: 7700, course: 'rice', isVeg: true },
];

export const paymentMethodSplit: import('@/lib/ury-types').PaymentMethodSplit[] = [
  { method: 'Gotovina', count: 68, amount: 42500, color: '#059669' },
  { method: 'Kartica', count: 72, amount: 53200, color: '#3b82f6' },
  { method: 'UPI', count: 47, amount: 28880, color: '#f59e0b' },
];

export const hourlyHeatmapData: import('@/lib/ury-types').HourlyHeatmapPoint[] = (() => {
  const days = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];
  const data: import('@/lib/ury-types').HourlyHeatmapPoint[] = [];
  for (const day of days) {
    for (let h = 10; h <= 23; h++) {
      const isWeekend = day === 'Sob' || day === 'Ned';
      const isPeak = h >= 12 && h <= 14 || h >= 19 && h <= 21;
      const base = isPeak ? (isWeekend ? 8000 : 6000) : (isWeekend ? 4000 : 2500);
      const value = Math.round(base * (0.7 + Math.random() * 0.6));
      data.push({ day, hour: h, value });
    }
  }
  return data;
})();

// ── Report Generator Mock Data ─────────────────────────

export const reportDataByPeriod: Record<string, import('@/lib/ury-types').ReportSummary> = {
  daily: {
    period: 'daily',
    periodLabel: '30. junij 2026',
    dateFrom: '2026-06-30',
    dateTo: '2026-06-30',
    totalRevenue: 124580,
    totalOrders: 187,
    avgOrderValue: 667,
    totalDiscounts: 4200,
    totalCancellations: 3,
    netRevenue: 120380,
    topItems: topSellingItems.slice(0, 5),
    dailyBreakdown: salesTrendByPeriod.today,
    paymentSplit: paymentMethodSplit,
    orderTypeSplit: [
      { type: 'Dine-in', count: 112, revenue: 74500 },
      { type: 'Takeaway', count: 52, revenue: 32800 },
      { type: 'Dostava', count: 23, revenue: 17280 },
    ],
    courseRevenue: [
      { course: 'Predjedi', revenue: 28400, items: 67 },
      { course: 'Glavne jedi', revenue: 48200, items: 58 },
      { course: 'Riž in kruh', revenue: 22100, items: 42 },
      { course: 'Sladice', revenue: 8600, items: 24 },
      { course: 'Pijača', revenue: 17280, items: 38 },
    ],
  },
  weekly: {
    period: 'weekly',
    periodLabel: '23. – 29. junij 2026',
    dateFrom: '2026-06-23',
    dateTo: '2026-06-29',
    totalRevenue: 785600,
    totalOrders: 1243,
    avgOrderValue: 632,
    totalDiscounts: 24800,
    totalCancellations: 18,
    netRevenue: 760800,
    topItems: topSellingItems,
    dailyBreakdown: salesTrendByPeriod.week,
    paymentSplit: [
      { method: 'Gotovina', count: 452, amount: 268000, color: '#059669' },
      { method: 'Kartica', count: 478, amount: 342000, color: '#3b82f6' },
      { method: 'UPI', count: 313, amount: 175600, color: '#f59e0b' },
    ],
    orderTypeSplit: [
      { type: 'Dine-in', count: 748, revenue: 472000 },
      { type: 'Takeaway', count: 342, revenue: 213600 },
      { type: 'Dostava', count: 153, revenue: 100000 },
    ],
    courseRevenue: [
      { course: 'Predjedi', revenue: 178000, items: 412 },
      { course: 'Glavne jedi', revenue: 302000, items: 386 },
      { course: 'Riž in kruh', revenue: 138000, items: 284 },
      { course: 'Sladice', revenue: 54600, items: 158 },
      { course: 'Pijača', revenue: 113000, items: 247 },
    ],
  },
  monthly: {
    period: 'monthly',
    periodLabel: 'Junij 2026',
    dateFrom: '2026-06-01',
    dateTo: '2026-06-30',
    totalRevenue: 3250000,
    totalOrders: 5180,
    avgOrderValue: 627,
    totalDiscounts: 98400,
    totalCancellations: 72,
    netRevenue: 3151600,
    topItems: topSellingItems,
    dailyBreakdown: salesTrendByPeriod.month,
    paymentSplit: [
      { method: 'Gotovina', count: 1860, amount: 1105000, color: '#059669' },
      { method: 'Kartica', count: 1980, amount: 1410000, color: '#3b82f6' },
      { method: 'UPI', count: 1340, amount: 735000, color: '#f59e0b' },
    ],
    orderTypeSplit: [
      { type: 'Dine-in', count: 3108, revenue: 1945000 },
      { type: 'Takeaway', count: 1420, revenue: 884000 },
      { type: 'Dostava', count: 652, revenue: 421000 },
    ],
    courseRevenue: [
      { course: 'Predjedi', revenue: 738000, items: 1720 },
      { course: 'Glavne jedi', revenue: 1254000, items: 1610 },
      { course: 'Riž in kruh', revenue: 572000, items: 1180 },
      { course: 'Sladice', revenue: 226000, items: 658 },
      { course: 'Pijača', revenue: 460000, items: 1012 },
    ],
  },
};
