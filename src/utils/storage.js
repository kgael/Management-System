import { uid } from "../utils/helpers";


const K_ITEMS = "inv_items";
const K_MOVES = "inv_moves";


export function getLS(key, fallback) {
try {
const raw = localStorage.getItem(key);
return raw ? JSON.parse(raw) : fallback;
} catch {
return fallback;
}
}


export function setLS(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error("Error al guardar en localStorage:", err);
  }
}


export function loadItems() {
const existing = getLS(K_ITEMS, null);
if (existing) return existing;
const sample = sampleItems();
setLS(K_ITEMS, sample);
return sample;
}


export function loadMoves() {
return getLS(K_MOVES, []);
}


export function saveItems(items) {
setLS(K_ITEMS, items);
}


export function saveMoves(moves) {
setLS(K_MOVES, moves);
}


export function sampleItems() {
const addDays = (n) => {
const x = new Date();
x.setDate(x.getDate() + n);
return x.toISOString().slice(0, 10);
};
return [
{ id: uid(), nombre: "Paracetamol 500mg", lote: "PCM-24-091", caducidad: addDays(45), unidad: "tab", cantidad: 120, minimo: 50, descartado: false },
{ id: uid(), nombre: "Amoxicilina 500mg", lote: "AMX-24-201", caducidad: addDays(-5), unidad: "cap", cantidad: 30, minimo: 20, descartado: false },
{ id: uid(), nombre: "Ibuprofeno 400mg", lote: "IBU-24-333", caducidad: addDays(200), unidad: "tab", cantidad: 15, minimo: 40, descartado: false },
];
}