import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function HistoryPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Seguimiento"
        title="Historial y progreso listos para evolucionar"
        description="Esta vista deja preparada una estructura para combinar eventos, emociones y futuros indicadores del progreso del usuario."
      />

      <section className="stats-grid">
        <StatCard
          value="12"
          label="registros de ejemplo"
          note="Espacio reservado para futuras consultas reales."
        />
        <StatCard
          value="4/5"
          label="promedio emocional"
          note="Ideal para tendencias diarias o semanales."
        />
        <StatCard
          value="3"
          label="objetivos activos"
          note="Bloque listo para terapias o metas de acompanamiento."
        />
      </section>

      <section className="timeline-panel">
        <h2>Linea de tiempo base</h2>
        <div className="timeline-list">
          <article className="timeline-item">
            <strong>08:30 - Inicio tranquilo</strong>
            <p>Registro emocional positivo al comenzar la jornada.</p>
          </article>
          <article className="timeline-item">
            <strong>11:00 - Solicito ayuda con pictogramas</strong>
            <p>Evento pensado para vincular comunicacion y acompanamiento.</p>
          </article>
          <article className="timeline-item">
            <strong>13:15 - Cambio de rutina observado</strong>
            <p>Espacio para anotar conducta, contexto y seguimiento posterior.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
