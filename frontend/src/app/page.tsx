import Link from "next/link";
import {
  Apple,
  Bath,
  BookOpen,
  Brush,
  CalendarDays,
  ClipboardList,
  Clock,
  Gamepad2,
  GlassWater,
  HandHeart,
  HeartPulse,
  Home,
  MessageSquare,
  Moon,
  Smile,
  Volume2
} from "lucide-react";

const coreWords = [
  { icon: <GlassWater />, label: "Quiero agua", group: "Necesidad" },
  { icon: <Apple />, label: "Tengo hambre", group: "Necesidad" },
  { icon: <Bath />, label: "Ir al bano", group: "Rutina" },
  { icon: <HandHeart />, label: "Ayudame", group: "Apoyo" },
  { icon: <Smile />, label: "Estoy bien", group: "Emocion" },
  { icon: <Moon />, label: "Descansar", group: "Estado" },
  { icon: <Brush />, label: "Pintar", group: "Actividad" },
  { icon: <Gamepad2 />, label: "Jugar", group: "Actividad" },
  { icon: <BookOpen />, label: "Leer", group: "Actividad" }
];

const routine = [
  { time: "08:30", title: "Llegada", status: "Listo" },
  { time: "10:00", title: "Actividad guiada", status: "Ahora" },
  { time: "11:15", title: "Descanso visual", status: "Luego" }
];

const quickLinks = [
  {
    href: "/communication",
    icon: <MessageSquare />,
    label: "Comunicar",
    detail: "Abrir tablero"
  },
  {
    href: "/emotions",
    icon: <HeartPulse />,
    label: "Emocion",
    detail: "Registrar ahora"
  },
  {
    href: "/history",
    icon: <ClipboardList />,
    label: "Historial",
    detail: "Ver seguimiento"
  }
];

export default function HomePage() {
  return (
    <div className="daily-board">
      <section className="workspace-header" aria-label="Resumen del dia">
        <div>
          <span className="section-label">Panel principal</span>
          <h1>Tablero del dia</h1>
          <p>
            Comunicacion rapida, emociones y rutina en una sola pantalla.
          </p>
        </div>
        <div className="today-chip">
          <CalendarDays aria-hidden="true" />
          <span>Hoy</span>
        </div>
      </section>

      <section className="message-strip" aria-label="Frase activa">
        <div>
          <span className="section-label">Frase activa</span>
          <div className="sentence-builder">
            <span>Yo</span>
            <span>quiero</span>
            <span>agua</span>
          </div>
        </div>
        <div className="message-actions">
          <button className="primary-button" type="button">
            <Volume2 aria-hidden="true" />
            Hablar
          </button>
          <button className="quiet-button" type="button">
            Limpiar
          </button>
        </div>
      </section>

      <div className="board-layout">
        <section className="tool-section" aria-label="Pictogramas frecuentes">
          <div className="section-heading">
            <div>
              <span className="section-label">Comunicacion</span>
              <h2>Pictogramas frecuentes</h2>
            </div>
            <Link className="text-link" href="/communication">
              Ver tablero
            </Link>
          </div>

          <div className="aac-grid">
            {coreWords.map((word) => (
              <button className="aac-tile" type="button" key={word.label}>
                <span className="tile-icon" aria-hidden="true">
                  {word.icon}
                </span>
                <strong>{word.label}</strong>
                <small>{word.group}</small>
              </button>
            ))}
          </div>
        </section>

        <aside className="side-panel" aria-label="Rutina y acciones">
          <section className="tool-section compact-section">
            <div className="section-heading">
              <div>
                <span className="section-label">Ahora</span>
                <h2>Rutina</h2>
              </div>
              <Clock aria-hidden="true" />
            </div>

            <div className="routine-list">
              {routine.map((item) => (
                <article className="routine-item" key={item.title}>
                  <span>{item.time}</span>
                  <strong>{item.title}</strong>
                  <small>{item.status}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="tool-section compact-section">
            <span className="section-label">Acciones</span>
            <div className="quick-action-list">
              {quickLinks.map((item) => (
                <Link className="quick-action" href={item.href} key={item.href}>
                  <span aria-hidden="true">{item.icon}</span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </Link>
              ))}
            </div>
          </section>

          <section className="tool-section compact-section">
            <div className="progress-summary">
              <Home aria-hidden="true" />
              <div>
                <span className="section-label">Seguimiento</span>
                <h2>Dia estable</h2>
                <p>2 registros, 1 emocion positiva y rutina sin alertas.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
