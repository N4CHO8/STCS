import Link from "next/link";
import { HARDWARE_DEMO_ACCOUNTS } from "@/lib/hardware-demo-accounts";
import { ROLE_NAMES } from "@/lib/permissions";
export default function DemoPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-12 text-stone-800">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-800">
          STCS · Demostración con dispositivo
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          Prueba los roles con Luis y su ESP
        </h1>
        <p className="mt-4 max-w-2xl text-stone-600">
          Estas tres cuentas usan el login habitual, guardan los cambios en la
          nube y comparten el perfil ficticio de Luis, vinculado a un ESP
          físico. Los correos son ficticios y no requieren activación. Cada rol
          mantiene sus propios permisos.
        </p>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          Los accesos son públicos y los cambios se comparten. Usa únicamente
          información ficticia. El administrador conserva su cuenta personal.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {HARDWARE_DEMO_ACCOUNTS.map((account) => (
            <article
              key={account.role}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold">
                {ROLE_NAMES[account.role]} demo
              </h2>
              <p className="mt-3 break-all text-sm text-stone-600">
                {account.email}
              </p>
              <p className="mt-3 text-sm">
                Contraseña:{" "}
                <code className="font-semibold">{account.password}</code>
              </p>
              <Link
                className="mt-6 block rounded-xl bg-emerald-800 px-5 py-3 text-center font-semibold text-white"
                href={`/login?email=${encodeURIComponent(account.email)}`}
              >
                Iniciar como {ROLE_NAMES[account.role]}
              </Link>
            </article>
          ))}
          <article className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Administrador real</h2>
            <p className="mt-3 text-sm text-stone-600">
              Usa tu correo verificado y tu contraseña personal. Conserva la
              gestión de usuarios y la configuración.
            </p>
            <Link
              href="/login"
              className="mt-6 block rounded-xl border border-emerald-800 px-5 py-3 text-center font-semibold text-emerald-900"
            >
              Ingresar a mi cuenta real
            </Link>
          </article>
        </div>
        <p className="mt-7 text-sm text-stone-500">
          Para futuras cuentas reales, el administrador registra el correo del
          titular y comparte su enlace de activación. Esa persona verifica su
          correo y elige su contraseña. Las cuentas reales mantienen los mismos
          flujos y permisos, con sus datos separados de esta demostración.
        </p>
      </section>
    </main>
  );
}
