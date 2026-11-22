import Link from "next/link";

export const metadata = { title: "Créditos | STCS" };

export default function CreditsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-stone-700">
      <Link href="/" className="font-semibold underline">
        Volver a STCS
      </Link>
      <h1 className="text-3xl font-bold">Créditos de los recursos gráficos</h1>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Pictogramas ARASAAC</h2>
        <p>
          Autor: Sergio Palao. Propiedad: Gobierno de Aragón. Procedencia:{" "}
          <a className="underline" href="https://arasaac.org">
            ARASAAC
          </a>
          . Licencia:{" "}
          <a className="underline" href="https://arasaac.org/terms-of-use">
            Creative Commons BY-NC-SA
          </a>
          .
        </p>
        <p>
          Las imágenes del catálogo se han reducido y colocado sobre fondo
          blanco, sin recortarlas. Se comparten bajo la misma licencia, para uso
          no comercial, con atribución.
        </p>
        <p>
          El especialista elige los símbolos y el tablero adecuados para cada
          niño. Utilizar ARASAAC no supone una aprobación de STCS por parte de
          sus autores.
        </p>
        <a
          className="inline-block underline"
          href="/pictograms/ARASAAC-CATALOG.json"
        >
          Consultar la procedencia de cada imagen
        </a>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Otros recursos</h2>
        <p>
          Los iconos de la interfaz usan Lucide, bajo{" "}
          <a className="underline" href="/pictograms/LUCIDE-LICENSE.txt">
            licencia ISC
          </a>
          . Inseguridad, Frustración y Entusiasmo se han retirado del selector
          hasta revisión profesional. Sus imágenes anteriores de Lucide se
          conservan solo para registros existentes.
        </p>
        <p>
          Las imágenes propias que suben los adultos conservan su procedencia y
          permisos; no se atribuyen a ARASAAC.
        </p>
      </section>
    </main>
  );
}
