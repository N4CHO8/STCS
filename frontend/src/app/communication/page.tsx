import {
  Apple,
  Bath,
  Brush,
  GlassWater,
  HandHeart,
  Moon
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { PictogramTile } from "@/components/ui/PictogramTile";

const pictograms = [
  { icon: <GlassWater />, label: "Quiero agua", category: "Necesidad" },
  { icon: <Apple />, label: "Tengo hambre", category: "Necesidad" },
  { icon: <Bath />, label: "Ir al bano", category: "Rutina" },
  { icon: <Brush />, label: "Quiero pintar", category: "Actividad" },
  { icon: <Moon />, label: "Tengo sueno", category: "Estado" },
  { icon: <HandHeart />, label: "Ayudame", category: "Apoyo" }
];

export default function CommunicationPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Comunicacion"
        title="Tablero de pictogramas"
        description="Selecciona pictogramas grandes y consistentes para formar una frase corta."
      />

      <section className="message-strip" aria-label="Frase actual">
        <div>
          <span className="section-label">Frase actual</span>
          <div className="sentence-builder">
            <span>Yo</span>
            <span>quiero</span>
            <span>agua</span>
          </div>
        </div>
        <div className="message-actions">
          <button className="primary-button" type="button">
            Hablar
          </button>
          <button className="quiet-button" type="button">
            Limpiar
          </button>
        </div>
      </section>

      <section className="pictogram-grid" aria-label="Pictogramas disponibles">
        {pictograms.map((item) => (
          <PictogramTile key={item.label} {...item} />
        ))}
      </section>
    </div>
  );
}
