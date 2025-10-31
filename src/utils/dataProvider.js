// src/utils/dataProvider.js
const API = import.meta.env.VITE_API_URL; // por ejemplo

export async function getItems() {
  if (!API) return JSON.parse(localStorage.getItem("inv_items") || "[]");
  const res = await fetch(`${API}/api/items`);
  return await res.json();
}