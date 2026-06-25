import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  MessageSquare,
  Settings,
  Volume2
} from "lucide-react";

import { defaultPictograms } from "@/lib/pictograms";

const quickButtons = defaultPictograms.filter((item) =>
  [
    "need-water",
    "food-eat",
    "need-bathroom",
    "core-help",
    "emo-happy",
    "emo-sad",
    "sens-quiet",
    "health-pain"
  ].includes(item.id)
);

const dailyOptions = [
  {
    href: "/communication",
    icon: <MessageSquare aria-hidden="true" />,
    title: "Hablar",
    text: "Abrir tablero"
  },
  {
    href: "/emotions",
    icon: <HeartPulse aria-hidden="true" />,
    title: "Emocion",
    text: "Registrar estado"
  },
  {
    href: "/history",
    icon: <ClipboardList aria-hidden="true" />,
    title: "Historial",
    text: "Revisar avances"
  }
];

const routine = [
  { time: "Ahora", title: "Comunicar", detail: "Usar pictogramas" },
  { time: "Luego", title: "Registrar", detail: "Guardar emocion" },
  { time: "Final", title: "Revisar", detail: "Ver historial" }
];

export default function HomePage() {
  return (
    <div className="home-board">
      <section className="home-hero" aria-label="Inicio">
        <div className="home-hero-copy">
          <span className="section-label">STCS</span>
          <h1>Que quieres decir hoy?</h1>
        </div>

        <Link className="home-big-action" href="/communication">
          <MessageSquare aria-hidden="true" />
          Abrir tablero
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="home-message-card" aria-label="Mensaje rapido">
        <div>
          <span className="section-label">Mensaje rapido</span>
          <div className="home-message-row">
            <span>Yo</span>
            <span>quiero</span>
            <span>agua</span>
          </div>
        </div>
        <button className="primary-button" type="button">
          <Volume2 aria-hidden="true" />
          Hablar
        </button>
      </section>

      <section className="home-actions-grid" aria-label="Acciones principales">
        {dailyOptions.map((option) => (
          <Link className="home-action-card" href={option.href} key={option.href}>
            <span>{option.icon}</span>
            <strong>{option.title}</strong>
            <small>{option.text}</small>
          </Link>
        ))}
      </section>

      <section className="home-two-column">
        <article className="preview-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">Uso frecuente</span>
              <h2>Botones rapidos</h2>
            </div>
            <Link className="text-link" href="/communication">
              Ver todos
            </Link>
          </div>

          <div className="home-aac-preview">
            {quickButtons.map((item) => (
              <Link
                className={`home-aac-button tone-${item.tone}`}
                href="/communication"
                key={item.id}
              >
                <span aria-hidden="true">{item.emoji}</span>
                <strong>{item.label}</strong>
              </Link>
            ))}
          </div>
        </article>

        <aside className="daily-side-panel">
          <section className="daily-card">
            <div className="section-heading">
              <div>
                <span className="section-label">Hoy</span>
                <h2>Rutina simple</h2>
              </div>
              <CalendarDays aria-hidden="true" />
            </div>
            <div className="routine-list">
              {routine.map((item) => (
                <article className="routine-item" key={item.title}>
                  <span>{item.time}</span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </article>
              ))}
            </div>
          </section>

          <Link className="caregiver-shortcut" href="/communication">
            <Settings aria-hidden="true" />
            <span>
              <strong>Ajustar botones</strong>
              <small>Agregar o editar pictogramas</small>
            </span>
          </Link>
        </aside>
      </section>
    </div>
  );
}
