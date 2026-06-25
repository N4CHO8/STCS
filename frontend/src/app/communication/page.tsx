import { CommunicationPrototype } from "@/components/communication/CommunicationPrototype";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CommunicationPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Comunicacion"
        title="Tablero CAA para hablar con pictogramas"
        description="Selecciona botones, forma mensajes simples y usa la voz del navegador. Los cuidadores pueden agregar o editar pictogramas."
      />

      <CommunicationPrototype />
    </div>
  );
}
