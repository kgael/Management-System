import { useState } from "react";

export default function Login({ onSuccess }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-amber-50 to-white">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-5 items-center text-center ">
          <div>
            <h1 className="text-2xl font-bold text-blue-700 text-center"> Clínica Santa Cruz</h1>
           
          </div>

        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            onSuccess(user, pass, setError);
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-xs text-gray-700">Usuario</label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin / enfermeria / farmacia"
            />
          </div>
          <div>
            <label className="text-xs text-gray-700">Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="123456 / 1234"
            />
          </div>

          {error && <div className="text-xs text-rose-600">{error}</div>}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
