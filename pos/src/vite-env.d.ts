/// <reference types="vite/client" />

// R41-FIX: Module augmentation for jspdf-autotable.
// jspdf-autotable adds a `lastAutoTable` property to jsPDF instances at runtime,
// but its type definitions don't include this. Declaring it here avoids `as any`.
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}
