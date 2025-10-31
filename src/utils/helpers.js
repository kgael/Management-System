export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function diasEntre(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function descargarJSON(nombreBase, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombreBase}_${hoyISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
