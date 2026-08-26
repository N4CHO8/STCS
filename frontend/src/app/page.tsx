import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BluetoothConnected,
  ClipboardList,
  Cpu,
  HeartPulse,
  LayoutGrid,
  MessageSquare,
  Settings,
  Wifi
} from "lucide-react";

import { defaultPictograms } from "@/lib/pictograms";

const deviceButtons = defaultPictograms.filter((item) =>
  [
    "need-water",
    "food-eat",
    "need-bathroom",
    "core-help",
    "emo-sad",
    "sens-quiet"
  ].includes(item.id)
);

const modules = [
  {
    href: "/communication",
    icon: <LayoutGrid aria-hidden="true" />,
    title: "Tablero CAA",
    detail: "Configurar botones, categorias y frases del dispositivo."
  },
  {
    href: "/emotions",
    icon: <HeartPulse aria-hidden="true" />,
    title: "Registro emocional",
    detail: "Guardar estados y observaciones de acompanamiento."
  },
  {
    href: "/history",
    icon: <ClipboardList aria-hidden="true" />,
    title: "Seguimiento",
    detail: "Revisar historial y avances del usuario."
  }
];

const deviceSteps = [
  "El cuidador configura pictogramas en la web.",
  "El tablero se sincroniza al ESP32-S3 por Wi-Fi.",
  "El nino toca botones grandes en la pantalla redonda.",
  "La web recibe registros para seguimiento."
];

export default function HomePage() {
  return (
    <div className="home-board esp-home">
      <section className="esp-hero" aria-label="Inicio STCS">
        <div className="esp-hero-copy">
          <span className="section-label">STCS</span>
          <h1>Comunicacion rapida desde un dispositivo fisico.</h1>
          <p>
            La plataforma web permite preparar el tablero, revisar registros y
            acompanar el progreso. El dispositivo ESP32-S3 entrega una interfaz
            tactil simple para que el nino pueda comunicar necesidades basicas
            con pictogramas.
          </p>
          <div className="hero-actions">
            <Link className="hero-primary-link" href="/communication">
              Configurar tablero
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="hero-secondary-link" href="/portal">
              Abrir portal
            </Link>
          </div>
        </div>

        <div className="round-device-card" aria-label="Vista del dispositivo">
          <div className="device-status-row">
            <span>
              <Cpu aria-hidden="true" />
              ESP32-S3
            </span>
            <span>
              <Wifi aria-hidden="true" />
              Wi-Fi
            </span>
          </div>

          <div className="round-screen">
            <div className="round-screen-header">
              <span>STCS</span>
              <Activity aria-hidden="true" />
            </div>
            <div className="round-screen-grid">
              {deviceButtons.map((item) => (
                <span className={`round-screen-button tone-${item.tone}`} key={item.id}>
                  <strong aria-hidden="true">{item.emoji}</strong>
                  <small>{item.label}</small>
                </span>
              ))}
            </div>
          </div>

          <p className="device-caption">
            Prototipo pensado para pantallas pequenas: pocas acciones por vista,
            alto contraste y botones tactiles grandes.
          </p>
        </div>
      </section>

      <section className="device-flow-grid" aria-label="Funcionamiento del sistema">
        <article className="device-flow-card device-flow-card-primary">
          <span>
            <BluetoothConnected aria-hidden="true" />
          </span>
          <div>
            <strong>Web + dispositivo</strong>
            <p>
              La app web administra el contenido. La placa ESP32-S3 usa ese
              contenido para comunicacion rapida y portatil.
            </p>
          </div>
        </article>
        {deviceSteps.map((step, index) => (
          <article className="device-flow-card" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </article>
        ))}
      </section>

      <section className="home-actions-grid esp-module-grid" aria-label="Modulos principales">
        {modules.map((module) => (
          <Link className="home-action-card" href={module.href} key={module.href}>
            <span>{module.icon}</span>
            <strong>{module.title}</strong>
            <small>{module.detail}</small>
          </Link>
        ))}
      </section>

      <section className="home-two-column">
        <article className="preview-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">Tablero inicial</span>
              <h2>Pictogramas prioritarios</h2>
            </div>
            <Link className="text-link" href="/communication">
              Editar
            </Link>
          </div>

          <div className="home-aac-preview">
            {deviceButtons.map((item) => (
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
                <span className="section-label">Cuidadores</span>
                <h2>Gestion simple</h2>
              </div>
              <Settings aria-hidden="true" />
            </div>
            <div className="routine-list">
              <article className="routine-item">
                <span>1</span>
                <strong>Crear botones</strong>
                <small>Texto, categoria y color CAA.</small>
              </article>
              <article className="routine-item">
                <span>2</span>
                <strong>Sincronizar</strong>
                <small>Preparado para envio al ESP32.</small>
              </article>
              <article className="routine-item">
                <span>3</span>
                <strong>Revisar uso</strong>
                <small>Base para historial y progreso.</small>
              </article>
            </div>
          </section>

          <Link className="caregiver-shortcut" href="/communication">
            <MessageSquare aria-hidden="true" />
            <span>
              <strong>Abrir comunicador</strong>
              <small>Probar flujo de pictogramas</small>
            </span>
          </Link>
        </aside>
      </section>
    </div>
  );
}
