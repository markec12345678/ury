import { Server } from "socket.io";

const io = new Server(3003, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

console.log("🍳 URY Real-time Simulation Service running on port 3003");

// Simulated menu items for random order generation
const menuItems = [
  { name: "Butter Chicken", qty: [1, 2], course: "Main Course" },
  { name: "Paneer Tikka", qty: [1, 2], course: "Starters" },
  { name: "Chicken Biryani", qty: [1, 2, 3], course: "Rice" },
  { name: "Naan", qty: [2, 3, 4], course: "Breads" },
  { name: "Dal Makhani", qty: [1], course: "Main Course" },
  { name: "Mutton Rogan Josh", qty: [1], course: "Main Course" },
  { name: "Tandoori Roti", qty: [2, 3], course: "Breads" },
  { name: "Kadai Paneer", qty: [1], course: "Main Course" },
  { name: "Jeera Rice", qty: [1, 2], course: "Rice" },
  { name: "Mango Lassi", qty: [1, 2], course: "Beverages" },
  { name: "Gulab Jamun", qty: [2], course: "Desserts" },
  { name: "Chicken Tikka", qty: [1, 2], course: "Starters" },
  { name: "Mixed Grill", qty: [1], course: "Starters" },
  { name: "Raita", qty: [1], course: "Accompaniments" },
  { name: "Fish Curry", qty: [1], course: "Main Course" },
  { name: "Kulcha", qty: [2], course: "Breads" },
];

const tables = ["T1", "T3", "T4", "T6", "T8", "T10", "T12", "T15", "T17", "T19", "T20", "T22", "T24", "T25", "T29", "T31"];
const productionUnits = ["Kuhinja 1", "Kuhinja 2", "Bar"];
const customers = [
  "Rajesh Sharma", "Priya Patel", "Ananya Reddy", "Vikram Singh",
  "Neha Gupta", "Arjun Menon", "Deepa Nair", "Suresh Kumar",
  "Meera Iyer", "Kiran Rao", "Pooja Desai", "Amit Joshi",
];
const kotTypes: Array<"New Order" | "Order Modified" | "Partially cancelled"> = ["New Order", "New Order", "New Order", "Order Modified", "Partially cancelled"];

let kotCounter = 300;
let orderCounter = 100;

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateKOT() {
  kotCounter++;
  orderCounter++;
  const numItems = randomInt(1, 4);
  const selectedItems = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < numItems; i++) {
    let idx: number;
    do { idx = randomInt(0, menuItems.length - 1); } while (usedIndices.has(idx));
    usedIndices.add(idx);
    const item = menuItems[idx];
    selectedItems.push({
      name: item.name,
      qty: randomFrom(item.qty),
      course: item.course,
      comments: Math.random() > 0.7 ? randomFrom(["Extra spicy", "Less oil", "No onion", "Double portion"]) : undefined,
    });
  }

  const isBar = Math.random() > 0.85;
  const production = isBar ? "Bar" : randomFrom(["Kuhinja 1", "Kuhinja 2"]);
  const isTakeaway = Math.random() > 0.8;

  const now = new Date();
  const timePlaced = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return {
    id: `KOT-${kotCounter}`,
    orderNo: `#${orderCounter}`,
    table: isTakeaway ? "Takeaway" : randomFrom(tables),
    items: selectedItems,
    timePlaced,
    elapsed: 0,
    status: "new" as const,
    production,
    kotType: randomFrom(kotTypes),
    customer: randomFrom(customers),
  };
}

// Simulate table status changes
function generateTableEvent() {
  const tableId = randomInt(1, 32);
  const statuses: Array<"free" | "occupied" | "attention"> = ["occupied", "occupied", "attention", "free"];
  const status = randomFrom(statuses);

  return {
    tableId,
    status,
    pax: status === "free" ? 0 : randomInt(1, 8),
    customer: status === "free" ? undefined : randomFrom(customers),
    occupiedSince: status === "free" ? undefined : `${randomInt(1, 60)}`,
  };
}

// Connection handling
io.on("connection", (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`📱 Client disconnected: ${socket.id}`);
  });
});

// Simulate new KOT events every 8-20 seconds
function scheduleKOT() {
  const delay = randomInt(8000, 20000);
  setTimeout(() => {
    const kot = generateKOT();
    console.log(`🍳 New KOT: ${kot.id} — ${kot.items.map((i) => i.name).join(", ")}`);
    io.emit("kot_new", kot);
    scheduleKOT();
  }, delay);
}

// Simulate KOT status changes every 10-25 seconds
function scheduleKOTStatusChange() {
  const delay = randomInt(10000, 25000);
  setTimeout(() => {
    const statuses: Array<"preparing" | "ready" | "served"> = ["preparing", "ready", "served"];
    const event = {
      kotId: `KOT-${randomInt(240, 300)}`,
      newStatus: randomFrom(statuses),
    };
    console.log(`🔄 KOT status: ${event.kotId} → ${event.newStatus}`);
    io.emit("kot_status_change", event);
    scheduleKOTStatusChange();
  }, delay);
}

// Simulate table status changes every 12-30 seconds
function scheduleTableEvent() {
  const delay = randomInt(12000, 30000);
  setTimeout(() => {
    const event = generateTableEvent();
    console.log(`🪑 Table ${event.tableId}: ${event.status}`);
    io.emit("table_status_change", event);
    scheduleTableEvent();
  }, delay);
}

// Start all simulators
scheduleKOT();
scheduleKOTStatusChange();
scheduleTableEvent();

console.log("📡 Real-time event simulation started:");
console.log("   - New KOT every 8-20 seconds");
console.log("   - KOT status changes every 10-25 seconds");
console.log("   - Table status changes every 12-30 seconds");
