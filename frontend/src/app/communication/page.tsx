import { CommunicationPrototype } from "@/components/communication/CommunicationPrototype";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CommunicationPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Comunicador"
        title="Tablero CAA para el dispositivo ESP32"
        description="Configura pictogramas, prueba mensajes simples y prepara el contenido que usara la pantalla tactil redonda."
      />

      <CommunicationPrototype />
    </div>
  );
}
