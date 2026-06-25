import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  HeartPulse,
  MessageSquare,
  Mic2,
  PencilRuler,
  ShieldCheck,
  Sparkles,
  Volume2
} from "lucide-react";

import { defaultPictograms, pictogramCategories } from "@/lib/pictograms";

const previewButtons = defaultPictograms.filter((item) =>
  [
    "core-i",
    "core-want",
    "need-water",
    "emo-sad",
    "sens-quiet",
    "school-dont-understand",
    "health-pain",
    "social-thanks"
  ].includes(item.id)
);

const demoSteps = [
  {
    icon: <MessageSquare aria-hidden="true" />,
    title: "1. Elegir",
    text: "El nino toca pictogramas grandes organizados por categorias."
  },
  {
    icon: <Mic2 aria-hidden="true" />,
    title: "2. Formar",
    text: "La app arma mensajes simples como: yo quiero agua."
  },
  {
    icon: <Volume2 aria-hidden="true" />,
    title: "3. Hablar",
    text: "El mensaje se puede reproducir por voz para el cuidador."
  }
];

const evidenceCards = [
  {
    icon: <Sparkles aria-hidden="true" />,
    value: `${pictogramCategories.length}`,
    label: "categorias CAA"
  },
  {
    icon: <PencilRuler aria-hidden="true" />,
    value: `${defaultPictograms.length}`,
    label: "botones base"
  },
  {
    icon: <ShieldCheck aria-hidden="true" />,
    value: "6-10",
    label: "anos objetivo"
  }
];

export default function HomePage() {
  return (
    <div className="presentation-home">
      <section className="hero-panel" aria-label="Presentacion del prototipo">
        <div className="hero-copy">
          <span className="section-label">Prototipo de mitigacion tecnica</span>
          <h1>Comunicacion clara con pictogramas para ninos con TEA</h1>
          <p>
            STCS valida el flujo central de la app: elegir pictogramas, formar
            un mensaje simple, escucharlo por voz y adaptar el tablero segun
            las necesidades del nino.
          </p>

          <div className="hero-actions">
            <Link className="hero-primary-link" href="/communication">
              Abrir tablero CAA
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="hero-secondary-link" href="/history">
              Ver seguimiento
            </Link>
          </div>
        </div>

        <div className="hero-demo-card" aria-label="Ejemplo de mensaje">
          <span className="demo-label">Mensaje de ejemplo</span>
          <div className="demo-message-row">
            <span>🙂 Yo</span>
            <span>🤲 quiero</span>
            <span>💧 agua</span>
          </div>
          <div className="demo-speech">
            <Volume2 aria-hidden="true" />
            <strong>La app puede leer el mensaje en voz alta</strong>
          </div>
        </div>
      </section>

      <section className="evidence-grid" aria-label="Evidencia del prototipo">
        {evidenceCards.map((card) => (
          <article className="evidence-card" key={card.label}>
            <span>{card.icon}</span>
            <strong>{card.value}</strong>
            <p>{card.label}</p>
          </article>
        ))}
      </section>

      <section className="home-two-column">
        <article className="preview-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">Vista rapida</span>
              <h2>Botones pensados para comunicar</h2>
            </div>
            <Link className="text-link" href="/communication">
              Probar
            </Link>
          </div>

          <div className="home-aac-preview">
            {previewButtons.map((item) => (
              <div className={`home-aac-button tone-${item.tone}`} key={item.id}>
                <span aria-hidden="true">{item.emoji}</span>
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>
        </article>

        <aside className="demo-flow-panel">
          <span className="section-label">Como se demuestra</span>
          <h2>Flujo corto para la presentacion</h2>
          <div className="demo-step-list">
            {demoSteps.map((step) => (
              <article className="demo-step" key={step.title}>
                <span>{step.icon}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="presenter-strip" aria-label="Modulos disponibles">
        <Link href="/communication">
          <MessageSquare aria-hidden="true" />
          Comunicacion
        </Link>
        <Link href="/emotions">
          <HeartPulse aria-hidden="true" />
          Emociones
        </Link>
        <Link href="/history">
          <ClipboardList aria-hidden="true" />
          Historial
        </Link>
      </section>
    </div>
  );
}
