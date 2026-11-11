"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveAuthSession } from "@/lib/auth";

export default function ActivatePage() {
  const router = useRouter();
  const [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    setEmail(
      new URLSearchParams(window.location.search).get("email")?.slice(0, 120) ??
        "",
    );
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (result.token) {
        saveAuthSession(result);
        router.replace("/");
      } else {
        setSent(true);
        setMessage(result.message);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo conectar.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 p-5">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Activar o recuperar cuenta</h1>
        <p className="my-4 text-sm text-stone-600">
          Usa el correo que registró tu administrador. Solo el titular puede
          establecer la contraseña.
        </p>
        <form onSubmit={submit} className="grid gap-4">
          <label className="grid gap-2">
            Correo electrónico
            <input
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              maxLength={120}
              readOnly={sent}
              autoComplete="email"
              className="rounded-lg border p-3"
            />
          </label>
          {sent && (
            <>
              <label className="grid gap-2">
                Código recibido por correo
                <input
                  name="code"
                  required
                  maxLength={12}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="rounded-lg border p-3"
                />
              </label>
              <label className="grid gap-2">
                Nueva contraseña (mínimo 12 caracteres)
                <input
                  name="password"
                  type="password"
                  required
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  className="rounded-lg border p-3"
                />
              </label>
            </>
          )}
          <button
            disabled={busy}
            className="rounded-xl bg-emerald-800 p-3 font-semibold text-white disabled:opacity-50"
          >
            {busy
              ? "Procesando…"
              : sent
                ? "Verificar y guardar contraseña"
                : "Enviar código"}
          </button>
          {sent && (
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setMessage("");
              }}
              className="text-sm underline"
            >
              Solicitar otro código
            </button>
          )}
          <p role="status" className="text-sm">
            {message}
          </p>
        </form>
        <Link
          href="/login"
          className="mt-5 block text-sm text-emerald-800 underline"
        >
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}
