import { FeatureCard } from "@/components/ui/FeatureCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { apiBaseUrl } from "@/lib/navigation";

export default function HomePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Inicio"
        title="Demo segura de acceso y seguimiento para STCS"
        description="Esta version del proyecto muestra un flujo real de inicio de sesion con control de acceso por rol, pensado para proteger la informacion y presentar el riesgo tecnico mitigado."
      />

      <section className="stats-grid" aria-label="Resumen del sistema">
        <StatCard
          value="3"
          label="roles demo"
          note="Cuidador, especialista y administrador."
        />
        <StatCard
          value="JWT"
          label="autenticacion activa"
          note="Token local para proteger el acceso a la informacion."
        />
        <StatCard
          value={apiBaseUrl}
          label="API protegida"
          note="Backend listo para validar sesion y permisos por rol."
        />
      </section>

      <section className="feature-grid">
        <FeatureCard
          title="Login real para la demo"
          description="La aplicacion ya no muestra solo una maqueta. Ahora valida credenciales, genera sesion y restringe el acceso segun el usuario."
          accent="blue"
        />
        <FeatureCard
          title="Informacion protegida por rol"
          description="Cada actor ingresa a un portal distinto: cuidador, especialista o administrador, mostrando solo la informacion que le corresponde."
          accent="green"
        />
        <FeatureCard
          title="Prototipo verificable"
          description="La mitigacion del riesgo se puede evidenciar con acceso valido, rechazo sin token y proteccion real de la informacion."
          accent="orange"
        />
      </section>

      <section className="two-column-section">
        <article className="soft-panel">
          <h2>Usuarios demo disponibles</h2>
          <ul className="clean-list">
            <li>`demo@stcs.local` / `Demo1234!`</li>
            <li>`terapeuta@stcs.local` / `Demo1234!`</li>
            <li>`admin@stcs.local` / `Demo1234!`</li>
          </ul>
        </article>

        <article className="soft-panel">
          <h2>Ruta sugerida para la presentacion</h2>
          <ul className="clean-list">
            <li>Ingresar a `Login` con un usuario demo.</li>
            <li>Mostrar el `Portal` con informacion segun el rol.</li>
            <li>Explicar que el acceso queda protegido por JWT.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
