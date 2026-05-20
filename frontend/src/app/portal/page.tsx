"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import {
  clearAuthSession,
  getAuthSession,
  getRoleLabel,
  type AuthSession,
  type PortalResponse
} from "@/lib/auth";
import { apiBaseUrl } from "@/lib/navigation";

interface PortalData {
  roleTitle?: string;
  student?: {
    fullName: string;
    age: number;
    supportLevel: string;
  };
  assignedCase?: string;
  summary: Record<string, string | number | string[]>;
  permissions: string[];
}

const getPortalEndpoint = (role: AuthSession["user"]["role"]): string => {
  switch (role) {
    case "guardian":
      return "guardian";
    case "therapist":
      return "especialista";
    case "admin":
      return "admin";
    default:
      return "resumen";
  }
};

const formatLabel = (value: string): string =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function PortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const currentSession = getAuthSession();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    const loadProtectedContent = async () => {
      try {
        const meResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${currentSession.token}`
          }
        });

        if (!meResponse.ok) {
          clearAuthSession();
          router.replace("/login");
          return;
        }

        const roleEndpoint = getPortalEndpoint(currentSession.user.role);
        const portalResponse = await fetch(`${apiBaseUrl}/portal/${roleEndpoint}`, {
          headers: {
            Authorization: `Bearer ${currentSession.token}`
          }
        });

        const portalPayload = (await portalResponse.json()) as PortalResponse<PortalData>;

        if (!portalResponse.ok || !portalPayload.data) {
          setErrorMessage(portalPayload.message ?? "No fue posible cargar el portal protegido.");
          return;
        }

        setSession(currentSession);
        setPortalData(portalPayload.data);
      } catch {
        setErrorMessage("No fue posible cargar la informacion protegida.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProtectedContent();
  }, [router]);

  if (isLoading) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Portal"
          title="Validando sesion segura"
          description="Se esta comprobando el token y cargando la informacion protegida segun el rol del usuario."
        />
      </div>
    );
  }

  if (!session || !portalData) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Portal"
          title="No fue posible abrir la informacion protegida"
          description={errorMessage || "La sesion ya no es valida. Vuelve a iniciar sesion."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Portal"
        title={`Panel protegido para ${getRoleLabel(session.user.role)}`}
        description="Esta vista solo se muestra cuando el login es valido y el backend confirma el acceso segun el rol del usuario."
      />

      <section className="stats-grid" aria-label="Resumen de la sesion">
        <article className="stat-card">
          <strong>{session.user.fullName}</strong>
          <span>Usuario autenticado</span>
          <p>{session.user.email}</p>
        </article>
        <article className="stat-card">
          <strong>{getRoleLabel(session.user.role)}</strong>
          <span>Rol validado</span>
          <p>{portalData.roleTitle ?? "Acceso controlado por backend."}</p>
        </article>
        <article className="stat-card">
          <strong>JWT</strong>
          <span>Sesion protegida</span>
          <p>La informacion se carga solo si el token es valido.</p>
        </article>
      </section>

      <section className="two-column-section">
        <article className="soft-panel">
          <h2>Informacion principal</h2>
          <div className="detail-list">
            {portalData.student ? (
              <>
                <div className="detail-item">
                  <strong>Nino asociado</strong>
                  <span>{portalData.student.fullName}</span>
                </div>
                <div className="detail-item">
                  <strong>Edad</strong>
                  <span>{portalData.student.age} anos</span>
                </div>
                <div className="detail-item">
                  <strong>Perfil de apoyo</strong>
                  <span>{portalData.student.supportLevel}</span>
                </div>
              </>
            ) : null}

            {portalData.assignedCase ? (
              <div className="detail-item">
                <strong>Caso asignado</strong>
                <span>{portalData.assignedCase}</span>
              </div>
            ) : null}

            {!portalData.student && !portalData.assignedCase ? (
              <div className="detail-item">
                <strong>Panel operativo</strong>
                <span>Acceso habilitado segun permisos del rol autenticado.</span>
              </div>
            ) : null}
          </div>
        </article>

        <article className="soft-panel">
          <h2>Permisos visibles en la demo</h2>
          <ul className="clean-list">
            {portalData.permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="soft-panel">
        <h2>Resumen protegido por rol</h2>
        <div className="detail-list">
          {Object.entries(portalData.summary).map(([key, value]) => (
            <div key={key} className="detail-item">
              <strong>{formatLabel(key)}</strong>
              <span>{Array.isArray(value) ? value.join(", ") : String(value)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
