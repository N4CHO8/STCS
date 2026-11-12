"use client";
import { FormEvent, useState, useRef } from "react";
import { ADULT_ROLES, ROLE_NAMES, type AdultRole } from "@/lib/permissions";
import type {
  ChildDetail,
  ChildSummary,
  ManagedUser,
  PortalData,
} from "@/types/portal";

export type SaveAction = (body: Record<string, unknown>) => Promise<void>;
const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800 focus:ring-2 focus:ring-emerald-200";
export function Field({
  label,
  name,
  value = "",
  type = "text",
  required = false,
  multiline = false,
  maxLength = 5000,
  readOnly = false,
}: {
  label: string;
  name: string;
  value?: string | number;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  readOnly?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-stone-700">
      {label}
      {multiline ? (
        <textarea
          className={inputClass}
          name={name}
          readOnly={readOnly}
          defaultValue={value}
          required={required}
          maxLength={maxLength}
          rows={4}
        />
      ) : (
        <input
          className={inputClass}
          name={name}
          type={type}
          readOnly={readOnly}
          defaultValue={value}
          required={required}
          maxLength={maxLength}
          min={type === "number" ? 1 : undefined}
          max={type === "number" ? 18 : undefined}
        />
      )}
    </label>
  );
}
function Form({
  children,
  onSave,
  label = "Guardar cambios",
}: {
  children: React.ReactNode;
  onSave: (data: FormData) => Promise<void>;
  label?: string;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      await onSave(data);
      setMessage("Cambios guardados correctamente.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-5">
      {children}
      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={busy}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Guardando…" : label}
        </button>
        <p role="status" className="text-sm text-stone-700">
          {message}
        </p>
      </div>
    </form>
  );
}
export function ProfileForm({
  detail,
  save,
}: {
  detail: ChildDetail;
  save: SaveAction;
}) {
  const p = detail.profile;
  return (
    <Form
      onSave={async (data) =>
        save({
          action: "profile",
          profileId: p.id,
          ...Object.fromEntries(data),
          age: Number(data.get("age")),
        })
      }
    >
      <Field
        name="fullName"
        label="Nombre completo"
        value={p.fullName}
        maxLength={120}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="age" label="Edad" type="number" value={p.age} required />
        <Field
          name="mainContext"
          label="Contexto habitual"
          value={p.mainContext}
          maxLength={80}
          required
        />
      </div>
      <Field
        name="supportLevel"
        label="Necesidades de apoyo"
        value={p.supportLevel}
        maxLength={120}
        required
      />
      <Field
        name="notes"
        label="Antecedentes e información relevante"
        value={p.notes}
        multiline
      />
    </Form>
  );
}
export function ReportForm({
  profileId,
  save,
}: {
  profileId: string;
  save: SaveAction;
}) {
  const requestId = useRef<string>(crypto.randomUUID());
  return (
    <Form
      label="Publicar informe"
      onSave={async (data) =>
        save({
          action: "report",
          profileId,
          requestId: requestId.current,
          ...Object.fromEntries(data),
        }).then(() => {
          requestId.current = crypto.randomUUID();
        })
      }
    >
      <p className="text-sm text-stone-600">
        El diagnóstico y la evaluación son visibles solo para el especialista
        asignado y el apoderado.
      </p>
      <Field
        name="diagnosis"
        label="Diagnóstico y evaluación de comunicación y emociones"
        maxLength={10000}
        multiline
        required
      />
      <div className="rounded-xl bg-emerald-50 p-4">
        <Field
          name="guidance"
          label="Orientaciones para docentes (sin datos clínicos)"
          maxLength={3000}
          multiline
        />
        <p className="mt-2 text-xs text-emerald-900">
          Solo este campo se comparte con los docentes asignados. Describe
          apoyos concretos para comunicarse.
        </p>
      </div>
    </Form>
  );
}
export function SettingsForm({
  settings,
  save,
}: {
  settings: PortalData["settings"];
  save: SaveAction;
}) {
  return (
    <Form
      onSave={async (data) =>
        save({ action: "settings", ...Object.fromEntries(data) })
      }
    >
      <Field
        name="appTitle"
        label="Nombre de la aplicación"
        value={settings.appTitle}
        maxLength={80}
        required
      />
      <Field
        name="supportEmail"
        label="Correo de soporte"
        type="email"
        value={settings.supportEmail}
        maxLength={120}
      />
    </Form>
  );
}
export function AccountForm({
  user,
  profiles,
  save,
  onClose,
}: {
  user?: ManagedUser;
  profiles: ChildSummary[];
  save: SaveAction;
  onClose: () => void;
}) {
  const [role, setRole] = useState<AdultRole>(user?.role ?? "teacher");
  const availableProfiles = profiles.filter(
    (p) =>
      Boolean(p.isDemo) === Boolean(user?.isDemo) &&
      Boolean(p.isPrivateTest) === Boolean(user?.isPrivateTest),
  );
  return (
    <Form
      label={user ? "Actualizar cuenta" : "Crear cuenta"}
      onSave={async (data) => {
        await save({
          action: "user",
          id: user?.id,
          fullName: data.get("fullName"),
          email: data.get("email"),
          role,
          active: data.get("active") === "on",
          profileIds: data.getAll("profileIds"),
        });
        onClose();
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {user ? "Editar cuenta" : "Nueva cuenta"}
        </h3>
        <button type="button" onClick={onClose} className="text-sm underline">
          Cerrar
        </button>
      </div>
      <Field
        label="Nombre del adulto"
        name="fullName"
        value={user?.fullName}
        maxLength={120}
        required
      />
      <Field
        label={
          user
            ? "Correo verificado del titular (no se puede cambiar)"
            : "Correo real del titular"
        }
        name="email"
        type="email"
        value={user?.email}
        readOnly={!!user}
        maxLength={120}
        required
      />
      <label className="grid gap-2 text-sm font-semibold">
        Perfil
        <select
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value as AdultRole)}
        >
          {ADULT_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_NAMES[r]}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm text-stone-600">
        {user?.isPrivateTest
          ? "Esta cuenta demo con dispositivo solo accede a perfiles de demostración asignados y no requiere activación. Las cuentas reales nuevas verifican su correo."
          : user?.isDemo
            ? "Esta cuenta demo usa la contraseña de demostración y solo puede acceder a niños demo."
            : "El titular activa su cuenta desde el enlace de activación y verifica su correo. Las nuevas asignaciones clínicas requieren aprobación independiente."}
      </p>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="active"
          defaultChecked={user?.active ?? true}
        />
        Cuenta activa
      </label>
      {role !== "admin" && (
        <fieldset key={role} className="rounded-xl border border-stone-200 p-4">
          <legend className="px-2 text-sm font-semibold">
            Asignaciones {role === "guardian" ? "(máximo un niño)" : ""}
          </legend>
          <div className="grid max-h-52 gap-3 overflow-auto">
            {availableProfiles.length ? (
              availableProfiles.map((p) => (
                <label className="flex items-center gap-2" key={p.id}>
                  <input
                    type={role === "guardian" ? "radio" : "checkbox"}
                    name="profileIds"
                    value={p.id}
                    defaultChecked={user?.profileIds.includes(p.id)}
                  />
                  Usuario {p.number}
                </label>
              ))
            ) : (
              <p>No hay niños registrados.</p>
            )}
            {role === "guardian" && (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="profileIds"
                  value=""
                  defaultChecked={!user?.profileIds.length}
                />
                Sin asignación
              </label>
            )}
          </div>
        </fieldset>
      )}
    </Form>
  );
}
