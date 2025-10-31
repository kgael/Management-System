const AUTH_KEY = "inv_auth_user";

const USERS = [
  { user: "admin", pass: "123456", name: "Administrador", role: "Admin" },
  { user: "enfermeria", pass: "1234", name: "Enfermería", role: "Enfermería" },
  { user: "farmacia", pass: "1234", name: "Farmacia", role: "Farmacia" },
];

export function getUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Auth read error", err);
    return null;
  }
}

export function login(user, pass) {
  const found = USERS.find((u) => u.user === user && u.pass === pass);
  if (!found) return null;
  const payload = { user: found.user, name: found.name, role: found.role };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Auth write error", err);
  }
  return payload;
}

export function logout() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (err) {
    console.error("Auth remove error", err);
  }
}
