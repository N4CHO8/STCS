import { PageHeader } from "@/components/ui/PageHeader";
import { PictogramTile } from "@/components/ui/PictogramTile";

const pictograms = [
  { emoji: "🧃", label: "Quiero jugo", category: "Necesidades" },
  { emoji: "🍎", label: "Tengo hambre", category: "Necesidades" },
  { emoji: "🚻", label: "Ir al bano", category: "Rutinas" },
  { emoji: "🎨", label: "Quiero pintar", category: "Actividades" },
  { emoji: "😴", label: "Tengo sueno", category: "Estado" },
  { emoji: "🤝", label: "Ayudame", category: "Apoyo" }
];

export default function CommunicationPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Comunicacion"
        title="Estructura inicial para pictogramas"
        description="Esta vista deja preparada una grilla visual simple y botones amplios para construir la futura experiencia de comunicacion asistida."
      />

      <section className="soft-panel">
        <h2>Frase en construccion</h2>
        <div className="sentence-builder" aria-label="Area visual de frase">
          <span>Yo</span>
          <span>quiero</span>
          <span>jugo</span>
        </div>
        <p className="section-note">
          Este bloque sera el punto de partida para combinar pictogramas y formar
          mensajes completos.
        </p>
      </section>

      <section className="pictogram-grid" aria-label="Pictogramas disponibles">
        {pictograms.map((item) => (
          <PictogramTile key={item.label} {...item} />
        ))}
      </section>
    </div>
  );
}
