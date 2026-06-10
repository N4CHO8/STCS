import { CommunicationPrototype } from "@/components/communication/CommunicationPrototype";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CommunicationPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Comunicacion"
        title="Elige botones para hablar"
        description="Tablero visual con pictogramas organizados por categorias. Los cuidadores pueden agregar y ajustar botones."
      />

      <CommunicationPrototype />
    </div>
  );
}
