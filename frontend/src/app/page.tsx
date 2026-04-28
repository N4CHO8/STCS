import { FeatureCard } from "@/components/ui/FeatureCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { apiBaseUrl } from "@/lib/navigation";

export default function HomePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Inicio"
        title="Una base clara para acompanar la comunicacion y el progreso"
        description="Este proyecto parte con una experiencia simple, accesible y tranquila, pensada para crecer hacia pictogramas, registro emocional y seguimiento del desarrollo."
      />

      <section className="stats-grid" aria-label="Resumen del sistema">
        <StatCard
          value="3"
          label="modulos iniciales"
          note="Comunicacion, emociones y seguimiento."
        />
        <StatCard
          value="100%"
          label="entorno dockerizado"
          note="Frontend, backend y PostgreSQL listos para local."
        />
        <StatCard
          value={apiBaseUrl}
          label="API base"
          note="Variable preparada para futuras integraciones."
        />
      </section>

      <section className="feature-grid">
        <FeatureCard
          title="Comunicacion con pictogramas"
          description="La base visual ya contempla botones grandes, categorias claras y espacio para construir frases con apoyo visual."
          accent="blue"
        />
        <FeatureCard
          title="Registro de emociones"
          description="Se deja una estructura amigable para registrar estados emocionales con intensidad, observaciones y contexto."
          accent="green"
        />
        <FeatureCard
          title="Seguimiento del progreso"
          description="El historial y los indicadores base ya estan preparados para sumar metricas, tendencias y visualizaciones."
          accent="orange"
        />
      </section>

      <section className="two-column-section">
        <article className="soft-panel">
          <h2>Principios de diseno presentes desde el inicio</h2>
          <ul className="clean-list">
            <li>Jerarquia visual suave y facil de escanear.</li>
            <li>Bloques amplios, contrastes cuidados y lenguaje simple.</li>
            <li>Navegacion consistente para bajar la carga cognitiva.</li>
          </ul>
        </article>

        <article className="soft-panel">
          <h2>Proximas historias de usuario sugeridas</h2>
          <ul className="clean-list">
            <li>Catalogo real de pictogramas por categoria.</li>
            <li>Persistencia de emociones y registros por usuario.</li>
            <li>Panel de progreso con indicadores visuales.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
