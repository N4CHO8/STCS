"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { getAuthSession, saveAuthSession, type AuthSession } from "@/lib/auth";
import { apiBaseUrl } from "@/lib/navigation";

const demoAccounts = [
  {
    title: "Cuidador demo",
    email: "demo@stcs.local",
    password: "Demo1234!"
  },
  {
    title: "Especialista demo",
    email: "terapeuta@stcs.local",
    password: "Demo1234!"
  },
  {
    title: "Administrador demo",
    email: "admin@stcs.local",
    password: "Demo1234!"
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
      router.replace("/portal");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
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

      router.push("/portal");
      router.refresh();
    } catch {
      setErrorMessage("No fue posible conectar con el backend local.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Acceso"
        title="Ingreso protegido para la demo del prototipo"
        description="Inicia sesion con una cuenta demo para mostrar control de acceso por rol y proteccion de informacion dentro de la aplicacion."
      />

      <section className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electronico
            <input
              type="email"
              placeholder="usuario@stcs.local"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              placeholder="Ingresa tu contrasena"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Validando acceso..." : "Ingresar"}
          </button>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        </form>

        <aside className="login-help">
          <h2>Cuentas demo para la presentacion</h2>
          <div className="demo-account-list">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                className="demo-account-card"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                <strong>{account.title}</strong>
                <span>{account.email}</span>
                <span>{account.password}</span>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
