"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ROLE_NAMES } from "@/lib/permissions";
import type { ManagedUser, PortalData } from "@/types/portal";
import { AccountForm, SettingsForm, type SaveAction } from "./portal-forms";
const panel =
  "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7";
export function AdminWorkspace({
  data,
  active,
  save,
  setSection,
}: {
  data: PortalData;
  active: string;
  save: SaveAction;
  setSection: (section: "accounts") => void;
}) {
  const [linkMessage, setLinkMessage] = useState("");
  const [editing, setEditing] = useState<ManagedUser | "new" | null>(null);
  return (
    <>
      {active === "home" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Cuentas de adultos", data.users?.length ?? 0],
              ["Niños registrados", data.profiles.length],
              [
                "Cuentas activas",
                data.users?.filter((u) => u.active).length ?? 0,
              ],
            ].map(([label, value]) => (
              <div key={label} className={panel}>
                <p className="text-sm text-stone-500">{label}</p>
                <p className="mt-3 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <section className={panel}>
            <h2 className="text-lg font-bold">Perfiles protegidos</h2>
            <p className="mt-2 text-sm text-stone-500">
              Usa estos números para asignar profesionales y apoderados.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {data.profiles.map((p) => (
                <span
                  key={p.id}
                  className="rounded-xl bg-stone-100 px-4 py-3 font-semibold"
                >
                  {p.label}
                </span>
              ))}
            </div>
            <button
              className="mt-6 flex items-center gap-2 font-semibold text-emerald-800"
              onClick={() => setSection("accounts")}
            >
              Gestionar usuarios <ArrowRight size={16} />
            </button>
          </section>
        </>
      )}
      {active === "accounts" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setEditing("new")}
              className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white"
            >
              Crear usuario
            </button>
          </div>
          {editing && (
            <section className={panel}>
              <AccountForm
                key={editing === "new" ? "new" : editing.id}
                user={editing === "new" ? undefined : editing}
                profiles={data.profiles}
                save={save}
                onClose={() => setEditing(null)}
              />
            </section>
          )}
          {linkMessage && (
            <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm">
              {linkMessage}
            </p>
          )}
          <div className={`${panel} overflow-x-auto`}>
            <table className="w-full text-left text-sm">
              <caption className="mb-5 text-left text-lg font-bold">
                Adultos y asignaciones
              </caption>
              <thead>
                <tr className="border-b text-stone-500">
                  {["Nombre", "Perfil", "Estado", "Asignaciones", "Acción"].map(
                    (h) => (
                      <th key={h} className="px-2 py-3">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.users?.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-2 py-4">
                      <p className="font-semibold">{u.fullName}</p>
                      <p className="text-xs text-stone-500">{u.email}</p>
                      <p className="text-xs text-stone-500">
                        {u.isPrivateTest
                          ? "Prueba privada · credencial individual"
                          : u.isDemo
                            ? "Demo · sin activación"
                            : u.verified
                              ? "Correo verificado"
                              : "Pendiente de activación"}
                      </p>
                    </td>
                    <td className="px-2">{ROLE_NAMES[u.role]}</td>
                    <td className="px-2">{u.active ? "Activa" : "Inactiva"}</td>
                    <td className="px-2">
                      {u.profileIds
                        .map(
                          (id) =>
                            `${data.profiles.find((p) => p.id === id)?.label ?? "Usuario"}${data.profiles.find((p) => p.id === id)?.isDemo ? " (demo)" : ""}${u.pendingProfileIds?.includes(id) ? " (pendiente de aprobación)" : ""}`,
                        )
                        .filter(Boolean)
                        .join(", ") || "Sin asignación"}
                    </td>
                    <td className="px-2">
                      <button
                        className="font-semibold text-emerald-800 underline"
                        onClick={() => setEditing(u)}
                      >
                        Editar
                        <span className="sr-only"> {u.fullName}</span>
                      </button>
                      {!u.isDemo && !u.isPrivateTest && (
                        <button
                          className="mt-2 block text-xs text-emerald-800 underline"
                          onClick={async () => {
                            const url = new URL(
                              "/activate",
                              window.location.origin,
                            );
                            url.searchParams.set("email", u.email);
                            try {
                              await navigator.clipboard.writeText(url.href);
                              setLinkMessage(
                                "Enlace copiado. Envíalo al titular; solo él podrá verificar su correo y establecer la contraseña.",
                              );
                            } catch {
                              setLinkMessage(
                                "Enlace para enviar al titular: " + url.href,
                              );
                            }
                          }}
                        >
                          Copiar enlace de activación
                          <span className="sr-only"> de {u.fullName}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {active === "settings" && (
        <section className={panel}>
          <h2 className="mb-5 text-lg font-bold">
            Preferencias de la aplicación
          </h2>
          <SettingsForm settings={data.settings} save={save} />
        </section>
      )}
    </>
  );
}
