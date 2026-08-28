"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Cpu,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Wifi
} from "lucide-react";

import { getAuthSession, saveAuthSession, type AuthSession } from "@/lib/auth";

const demoAccounts = [
  {
    title: "Cuidadora",
    description: "Revisa actividad diaria y configuracion del comunicador.",
    email: "demo@stcs.local",
    password: "Demo1234!",
    icon: HeartHandshake
  },
  {
    title: "Docente",
    description: "Consulta eventos del contexto escolar asignado.",
    email: "docente@stcs.local",
    password: "Demo1234!",
    icon: GraduationCap
  },
  {
    title: "Especialista",
    description: "Analiza progreso comunicativo y emocional.",
    email: "terapeuta@stcs.local",
    password: "Demo1234!",
    icon: Stethoscope
  },
  {
    title: "Administrador",
    description: "Valida roles, accesos y configuracion general.",
    email: "admin@stcs.local",
    password: "Demo1234!",
    icon: UserCog
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@stcs.local");
  const [password, setPassword] = useState("Demo1234!");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (session) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const payload = (await response.json()) as AuthSession & { message?: string };

      if (!response.ok || !payload.token || !payload.user) {
        setErrorMessage(payload.message ?? "No fue posible iniciar sesion.");
        return;
      }

      saveAuthSession({
        token: payload.token,
        expiresIn: payload.expiresIn,
        user: payload.user
      });

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("No fue posible conectar con la API de autenticacion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700">
      <main className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-sage-700 via-sage-600 to-stone-800 px-6 py-10 text-white sm:px-10 lg:px-14">
          <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative z-10 flex min-h-full flex-col justify-between gap-12">
            <div>
              <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 p-3 shadow-sm ring-1 ring-white/15">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-display text-xl font-black text-sage-700">
                  S
                </div>
                <div>
                  <p className="font-display text-xl font-black">STCS</p>
                  <p className="text-sm text-white/75">Comunicador ESP32 + CAA</p>
                </div>
              </div>

              <h1 className="mt-12 max-w-xl font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Gestion para cuidadores y especialistas.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/78">
                Configura el tablero del dispositivo fisico, revisa eventos
                ficticios del ESP32 y valida el flujo de seguimiento del prototipo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <LoginFeature icon={Cpu} label="ESP32-S3" />
              <LoginFeature icon={Wifi} label="Sincronizacion" />
              <LoginFeature icon={ShieldCheck} label="Roles demo" />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-2xl">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1 text-sm font-bold text-sage-700">
                <ShieldCheck className="h-4 w-4" />
                Acceso protegido
              </span>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-stone-900">
                Iniciar sesion
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Usa una cuenta demo para ingresar al dashboard conectado a la base de datos.
              </p>
            </div>

            <form className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-stone-700">
                  Correo electronico
                  <input
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base outline-none transition focus:border-sage-500 focus:bg-white focus:ring-4 focus:ring-sage-100"
                    type="email"
                    placeholder="usuario@stcs.local"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-stone-700">
                  Contrasena
                  <input
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base outline-none transition focus:border-sage-500 focus:bg-white focus:ring-4 focus:ring-sage-100"
                    type="password"
                    placeholder="Ingresa tu contrasena"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sage-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-sage-700 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Validando acceso..." : "Ingresar al dashboard"}
                <ArrowRight className="h-5 w-5" />
              </button>
              {errorMessage ? (
                <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                  {errorMessage}
                </p>
              ) : null}
            </form>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;

                return (
                  <button
                    key={account.email}
                    type="button"
                    className="rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-sage-300 hover:bg-sage-50"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                  >
                    <span className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-sage-50 text-sage-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <strong className="block font-display text-lg font-black text-stone-900">
                      {account.title}
                    </strong>
                    <span className="mt-1 block text-sm leading-5 text-stone-500">
                      {account.description}
                    </span>
                    <span className="mt-3 block text-xs font-bold text-sage-700">
                      {account.email}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LoginFeature({
  icon: Icon,
  label
}: {
  icon: typeof Cpu;
  label: string;
}) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15">
      <Icon className="h-6 w-6" />
      <p className="mt-3 text-sm font-black">{label}</p>
    </div>
  );
}
