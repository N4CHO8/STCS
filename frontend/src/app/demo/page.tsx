"use client";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Portal } from "@/components/stcs/portal";
import { createDemo, resetDemo } from "@/lib/demo";
import { ADULT_ROLES, ROLE_NAMES, type AdultRole } from "@/lib/permissions";

const descriptions: Record<AdultRole, string> = {
  therapist: "Explora varias fichas, publica informes y prepara pictogramas.",
  teacher:
    "Prepara el comunicador y consulta orientaciones, sin diagnóstico ni progreso.",
  guardian: "Consulta y edita la ficha de un único niño ficticio.",
  admin:
    "Gestiona usuarios y configuración con niños identificados solo por número.",
};
export default function DemoPage() {
  const [role, setRole] = useState<AdultRole | null>(null),
    [revision, setRevision] = useState(0);
  const exit = useCallback(() => setRole(null), []);
  const demo = useMemo(
    () => (role ? createDemo(role, window.localStorage, exit) : undefined),
    [role, revision, exit],
  );
  return (
    <>
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
        <p>
          <strong>Modo demo</strong> · Datos ficticios, guardados solo en este
          navegador. No introduzcas información real.
        </p>
        <nav
          aria-label="Opciones de demostración"
          className="flex flex-wrap items-center gap-4"
        >
          {role && (
            <button onClick={exit} className="font-semibold underline">
              Cambiar perfil demo
            </button>
          )}
          <button
            onClick={() => {
              resetDemo(window.localStorage);
              setRevision((v) => v + 1);
            }}
            className="underline"
          >
            Reiniciar datos demo
          </button>
          <Link href="/" className="font-semibold underline">
            Volver a mi cuenta real
          </Link>
        </nav>
      </header>
      {demo ? (
        <Portal key={`${role}-${revision}`} demo={demo} />
      ) : (
        <main className="min-h-screen bg-stone-50 px-5 py-12 text-stone-800">
          <section className="mx-auto max-w-5xl">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-800">
              STCS · Demostración
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Prueba los cuatro perfiles
            </h1>
            <p className="mt-4 max-w-2xl text-stone-600">
              No necesitas crear correos ni activar estas cuentas demo. Puedes
              cambiar de perfil para ver cómo colaboran. Tu cuenta real de
              administrador se conserva.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {ADULT_ROLES.map((r) => (
                <article
                  key={r}
                  className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold">{ROLE_NAMES[r]} demo</h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
                    {descriptions[r]}
                  </p>
                  <button
                    onClick={() => setRole(r)}
                    className="mt-6 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white"
                  >
                    Entrar como {ROLE_NAMES[r]}
                  </button>
                </article>
              ))}
            </div>
            <p className="mt-7 text-sm text-stone-500">
              La demo simula los datos y el dispositivo. Para trabajar con
              personas reales se usa el acceso normal, con verificación de
              correo y aprobación de asignaciones clínicas.
            </p>
          </section>
        </main>
      )}
    </>
  );
}
