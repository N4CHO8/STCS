import { Frown, Laugh, Meh, Smile } from "lucide-react";

import { EmotionButton } from "@/components/ui/EmotionButton";
import { PageHeader } from "@/components/ui/PageHeader";

const emotions = [
  { icon: <Laugh />, label: "Contento", tone: "happy" as const },
  { icon: <Smile />, label: "Tranquilo", tone: "calm" as const },
  { icon: <Meh />, label: "Neutral", tone: "neutral" as const },
  { icon: <Frown />, label: "Inquieto", tone: "alert" as const }
];

export default function EmotionsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Emociones"
        title="Registro emocional"
        description="Elige una emocion, marca intensidad y deja una observacion breve."
      />

      <section className="tool-section">
        <h2>Como me siento hoy</h2>
        <div className="emotion-grid">
          {emotions.map((emotion) => (
            <EmotionButton key={emotion.label} {...emotion} />
          ))}
        </div>
      </section>

      <section className="two-column-section">
        <article className="tool-section">
          <h2>Intensidad</h2>
          <div className="scale-row" aria-label="Escala visual de intensidad">
            <span>1</span>
            <span>2</span>
            <span className="scale-active">3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </article>

        <article className="tool-section">
          <h2>Observaciones</h2>
          <p className="section-note">
            Aqui podras agregar contexto, desencadenantes, apoyos utilizados y
            cualquier dato relevante para el seguimiento.
          </p>
        </article>
      </section>
    </div>
  );
}
