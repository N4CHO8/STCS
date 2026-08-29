"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { getAuthSession, saveAuthSession, type AuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getAuthSession()) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const session = await authenticateUser(email, password);
      saveAuthSession(session);
      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesion."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfbf9] text-stone-500">
      <div className="grid min-h-screen place-items-center px-5 py-10">
        <section className="w-full max-w-[920px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:grid lg:grid-cols-[1fr_420px]">
          <LoginBrandPanel />
          <LoginForm
            email={email}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            password={password}
          />
        </section>
      </div>
    </main>
  );
}

async function authenticateUser(email: string, password: string): Promise<AuthSession> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const payload = await parseAuthResponse(response);

  if (!response.ok || !payload.token || !payload.user) {
    throw new Error(payload.message ?? "Credenciales invalidas.");
  }

  return {
    token: payload.token,
    expiresIn: payload.expiresIn,
    user: payload.user
  };
}

async function parseAuthResponse(response: Response): Promise<AuthSession & { message?: string }> {
  const text = await response.text();

  if (!text) {
    return {
      message: "La API no devolvio una respuesta valida."
    } as AuthSession & { message?: string };
  }

  try {
    return JSON.parse(text) as AuthSession & { message?: string };
  } catch {
    return {
      message: "La API devolvio una respuesta no valida."
    } as AuthSession & { message?: string };
  }
}

function LoginBrandPanel() {
  return (
    <div className="bg-[#f4f7f1] p-8 lg:p-10">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#518b51] font-display text-lg font-black text-white">
          S
        </div>
        <div>
          <p className="font-display text-xl font-black text-stone-700">STCS</p>
          <p className="text-xs font-medium text-stone-400">Portal de Apoyo</p>
        </div>
      </div>

      <h1 className="mt-14 max-w-md font-display text-4xl font-black leading-tight text-stone-700">
        Sistema TEA - Comunicaci&oacute;n y Seguimiento
      </h1>
    </div>
  );
}

function LoginForm({
  email,
  errorMessage,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  password
}: {
  email: string;
  errorMessage: string;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
}) {
  return (
    <div className="p-8 lg:p-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-[#518b51]">
        <ShieldCheck className="h-4 w-4" />
        Acceso protegido
      </span>

      <h2 className="mt-6 font-display text-3xl font-black text-stone-700">
        Iniciar sesion
      </h2>

      <form className="mt-7 grid gap-4" onSubmit={onSubmit}>
        <TextInput
          autoComplete="email"
          label="Correo electronico"
          onChange={onEmailChange}
          placeholder="usuario@stcs.local"
          type="email"
          value={email}
        />
        <TextInput
          autoComplete="current-password"
          label="Contrasena"
          onChange={onPasswordChange}
          placeholder="Ingresa tu contrasena"
          type="password"
          value={password}
        />

        <button
          className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#518b51] px-5 text-sm font-black text-white transition hover:bg-[#457745] disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Validando..." : "Ingresar"}
          <ArrowRight className="h-4 w-4" />
        </button>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function TextInput({
  autoComplete,
  label,
  onChange,
  placeholder,
  type,
  value
}: {
  autoComplete: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: "email" | "password";
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-stone-500">
      {label}
      <input
        autoComplete={autoComplete}
        className="h-12 rounded-xl border border-stone-200 bg-[#fbfbf9] px-4 text-base text-stone-600 outline-none transition focus:border-[#518b51] focus:bg-white focus:ring-4 focus:ring-emerald-50"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}
