"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  ShieldCheck,
  Users,
  MessageCircle,
  ClipboardList,
  ChartNoAxesCombined,
  Settings,
  RefreshCw,
  HeartHandshake,
} from "lucide-react";
import { clearAuthSession, getAuthSession, type AuthSession } from "@/lib/auth";
import { ROLE_NAMES, canEditBoard, canReadSensitive } from "@/lib/permissions";
import { mapPictogram } from "@/lib/stcsUi";
import type { PortalData } from "@/types/portal";
import {
  CommunicatorView,
  ProgressView,
  DashboardView,
  DevicesView,
} from "./views";
import { PaginatedHistory } from "./history";
import { AdminWorkspace } from "./admin-workspace";
import { ProfileForm, ReportForm, type SaveAction } from "./portal-forms";

type Section =
  | "home"
  | "board"
  | "profile"
  | "reports"
  | "progress"
  | "history"
  | "devices"
  | "accounts"
  | "settings";
const tabs = [
  { id: "home", label: "Mi espacio", icon: HeartHandshake },
  { id: "board", label: "Comunicación", icon: MessageCircle },
  { id: "profile", label: "Ficha del niño", icon: Users },
  { id: "reports", label: "Informes y orientaciones", icon: ClipboardList },
  { id: "progress", label: "Progreso", icon: ChartNoAxesCombined },
  { id: "history", label: "Actividad", icon: ClipboardList },
  { id: "devices", label: "Dispositivo", icon: Settings },
  { id: "accounts", label: "Usuarios y asignaciones", icon: Users },
  { id: "settings", label: "Configuración", icon: Settings },
] as const;
const panel =
  "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7";

export function Portal() {
  const router = useRouter();
  const latestRequest = useRef(0);
  const [session, setSession] = useState<AuthSession | null>(null),
    [data, setData] = useState<PortalData | null>(null),
    [selected, setSelected] = useState("");
  const [section, setSection] = useState<Section>("home"),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    const stored = getAuthSession();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setSession(stored);
  }, [router]);
  useEffect(() => {
    if (!session) return;
    const leave = () => {
      setData(null);
      setSession(null);
      clearAuthSession();
      router.replace("/login");
    };
    const sync = (event: StorageEvent) => {
      if (
        event.key === "stcs-auth-session" &&
        event.newValue !== JSON.stringify(session)
      )
        leave();
    };
    window.addEventListener("storage", sync);
    let timer: ReturnType<typeof setTimeout>;
    try {
      const exp = JSON.parse(
        atob(session.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ).exp;
      timer = setTimeout(leave, Math.max(0, exp * 1000 - Date.now()));
    } catch {
      leave();
    }
    return () => {
      window.removeEventListener("storage", sync);
      clearTimeout(timer);
    };
  }, [session, router]);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!session) return;
      // Ignore slower responses from a previously selected child or manual refresh.
      const requestId = ++latestRequest.current;
      const isCurrent = () =>
        !signal?.aborted && requestId === latestRequest.current;
      setBusy(true);
      setError("");
      try {
        const response = await fetch(
          `/api/stcs/portal${selected ? `?profileId=${selected}` : ""}`,
          {
            headers: { Authorization: `Bearer ${session.token}` },
            cache: "no-store",
            signal,
          },
        );
        if (!isCurrent()) return;
        if (response.status === 401) {
          clearAuthSession();
          router.replace("/login");
          return;
        }
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        if (isCurrent()) setData(payload.data);
      } catch (e) {
        if (isCurrent()) {
          setData(null);
          setError(e instanceof Error ? e.message : "No se pudo conectar.");
        }
      } finally {
        if (isCurrent()) setBusy(false);
      }
    },
    [session, selected, router],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      controller.abort();
      latestRequest.current++;
    };
  }, [load]);
  const save: SaveAction = async (body) => {
    setNotice("");
    const sanitized =
      body.action === "user"
        ? { ...body, profileIds: (body.profileIds as string[]).filter(Boolean) }
        : body;
    const response = await fetch("/api/stcs/portal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitized),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message);
    await load();
    setNotice("Cambios guardados correctamente.");
  };
  const role = data?.role,
    sensitive = role ? canReadSensitive(role) : false;
  const visible = tabs.filter((t) =>
    role === "admin"
      ? ["home", "accounts", "settings"].includes(t.id)
      : [
          "home",
          "board",
          "reports",
          ...(sensitive ? ["profile", "progress", "history", "devices"] : []),
        ].includes(t.id),
  );
  const active = visible.some((t) => t.id === section) ? section : "home";
  const detail = data?.detail;
  const profileId = detail?.profile.id ?? "";
  const navigate = (id: string) =>
    setSection(
      id === "communicator"
        ? "board"
        : id === "dashboard"
          ? "home"
          : (id as Section),
    );
  return (
    <div className="min-h-screen bg-[#f5f7f4] text-stone-800 lg:flex">
      <aside className="border-b border-stone-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="rounded-2xl bg-emerald-900 p-3 text-white">
            <HeartHandshake size={23} />
          </span>
          <div>
            <p className="text-xl font-bold tracking-tight">
              {data?.settings.appTitle ?? "STCS"}
            </p>
            <p className="text-xs text-stone-500">
              Comunicación y acompañamiento
            </p>
          </div>
        </div>
        <nav
          aria-label="Navegación principal"
          className="flex gap-2 overflow-x-auto px-3 pb-4 lg:grid"
        >
          {visible.map((t) => (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              aria-current={active === t.id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${active === t.id ? "bg-emerald-50 text-emerald-900" : "text-stone-600 hover:bg-stone-50"}`}
            >
              <t.icon size={18} />
              {role === "teacher" && t.id === "reports"
                ? "Orientaciones"
                : t.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t p-5 lg:mt-auto">
          <div>
            <p className="text-sm font-semibold">{session?.user.fullName}</p>
            <p className="text-xs text-stone-500">
              {role ? ROLE_NAMES[role] : ""}
            </p>
          </div>
          <button
            aria-label="Cerrar sesión"
            onClick={async () => {
              try {
                const response = await fetch("/api/auth/logout", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${session?.token}` },
                });
                if (!response.ok && response.status !== 401)
                  throw new Error(
                    "No se pudo cerrar la sesión en el servidor. Reintenta.",
                  );
                setData(null);
                setSession(null);
                clearAuthSession();
                router.replace("/login");
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "No se pudo conectar para cerrar la sesión.",
                );
              }
            }}
            className="rounded-lg p-2 hover:bg-stone-100"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
                {role ? ROLE_NAMES[role] : "Bienvenido"}
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {role === "teacher" && active === "reports"
                  ? "Orientaciones de comunicación"
                  : (visible.find((t) => t.id === active)?.label ??
                    "Tu espacio STCS")}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {role !== "admin" && !!data?.profiles.length && (
                <label className="grid gap-1 text-xs font-semibold text-stone-500">
                  Niño asignado
                  <select
                    aria-label="Seleccionar niño asignado"
                    value={selected || profileId}
                    onChange={(e) => {
                      setData(null);
                      setSelected(e.target.value);
                    }}
                    className="min-w-40 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800"
                  >
                    {data.profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                onClick={() => void load()}
                disabled={busy}
                aria-label="Actualizar datos"
                className="rounded-xl border bg-white p-3 disabled:opacity-50"
              >
                <RefreshCw size={18} className={busy ? "animate-spin" : ""} />
              </button>
            </div>
          </header>
          {!!data?.pendingApprovals?.length && (
            <section className={panel}>
              <h2 className="font-bold">Solicitudes de acceso pendientes</h2>
              <p className="my-2 text-sm">
                Confirma la identidad y autorización de cada adulto antes de
                permitir acceso a la ficha.
              </p>
              {data.pendingApprovals.map((p) => (
                <div
                  key={p.actorId + p.profileId}
                  className="flex flex-wrap items-center gap-3 border-t py-3"
                >
                  <span>
                    {p.name} · {p.email} (
                    {ROLE_NAMES[p.role as "therapist" | "guardian"]}) · Usuario{" "}
                    {p.number}
                  </span>
                  {[true, false].map((approve) => (
                    <button
                      disabled={busy}
                      key={String(approve)}
                      className="rounded-lg border px-3 py-2 text-sm"
                      onClick={() =>
                        void save({
                          action: "approval",
                          actorId: p.actorId,
                          profileId: p.profileId,
                          approve,
                        }).catch((e) => setError(e.message))
                      }
                    >
                      {approve ? "Aprobar" : "Rechazar"}
                    </button>
                  ))}
                </div>
              ))}
            </section>
          )}
          {notice && !busy && (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 p-4 text-emerald-900"
            >
              {notice}
            </p>
          )}
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}
          {busy ? (
            <div role="status" className={panel}>
              Cargando tu espacio…
            </div>
          ) : (
            data && (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <ShieldCheck size={19} className="shrink-0" />
                  {role === "admin"
                    ? "Administración sin acceso a nombres ni información sensible de los niños."
                    : role === "teacher"
                      ? "Tu espacio se centra en apoyar la comunicación. Aquí solo verás orientaciones compartidas por el especialista."
                      : "Espacio privado. Solo puedes consultar los niños que tienes asignados."}
                </div>
                {role === "admin" ? (
                  <AdminWorkspace
                    data={data}
                    active={active}
                    save={save}
                    setSection={setSection}
                  />
                ) : !detail ? (
                  <section className={panel}>
                    <h2 className="font-bold">
                      Todavía no tienes un niño asignado
                    </h2>
                    <p className="mt-2 text-stone-600">
                      Solicita al administrador que vincule tu cuenta y al
                      apoderado o especialista autorizado que apruebe el acceso
                      antes de comenzar.
                    </p>
                  </section>
                ) : (
                  <>
                    {active === "home" && (
                      <>
                        <section className="rounded-2xl bg-emerald-900 p-7 text-white">
                          <p className="text-sm text-emerald-100">
                            Acompañamos su forma de comunicarse
                          </p>
                          <h2 className="mt-2 text-3xl font-bold">
                            {detail.profile.label}
                          </h2>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50">
                            {role === "teacher"
                              ? "Prepara los pictogramas del comunicador y consulta las recomendaciones del especialista para acompañar cada interacción."
                              : "Encuentra su ficha, las evaluaciones del especialista y la actividad del comunicador en un mismo lugar."}
                          </p>
                          <div className="mt-6 flex flex-wrap gap-3">
                            <button
                              onClick={() =>
                                setSection(
                                  role === "teacher" ? "board" : "reports",
                                )
                              }
                              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-900"
                            >
                              {role === "teacher"
                                ? "Preparar comunicador"
                                : "Ver informes"}
                            </button>
                            <button
                              onClick={() =>
                                setSection(
                                  role === "teacher" ? "reports" : "profile",
                                )
                              }
                              className="rounded-xl border border-emerald-500 px-5 py-3 text-sm font-semibold"
                            >
                              {role === "teacher"
                                ? "Leer orientaciones"
                                : "Abrir ficha"}
                            </button>
                          </div>
                        </section>
                        {sensitive && detail.overview && (
                          <DashboardView
                            embedded
                            canConfigureBoard={role === "therapist"}
                            data={detail.overview}
                            name={session?.user.fullName ?? ""}
                            onNavigate={navigate}
                          />
                        )}
                      </>
                    )}
                    {active === "board" &&
                      (canEditBoard(role ?? "") ? (
                        <CommunicatorView
                          key={profileId}
                          profileId={profileId}
                          token={session?.token ?? ""}
                          pictograms={detail.pictograms.map(mapPictogram)}
                          onSaved={() => void load()}
                          onDeleted={() => void load()}
                        />
                      ) : (
                        <section className={panel}>
                          <h2 className="text-lg font-bold">
                            Tablero de comunicación
                          </h2>
                          <p className="mt-2 text-sm text-stone-500">
                            El especialista y el docente preparan este tablero
                            para el ESP.
                          </p>
                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {detail.pictograms.map((p) => (
                              <div
                                key={p.id}
                                className="rounded-xl border p-4 text-center"
                              >
                                <p className="font-bold">{p.label}</p>
                                <p className="mt-1 text-sm text-stone-500">
                                  {p.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    {active === "profile" && sensitive && (
                      <section className={panel}>
                        <h2 className="mb-5 text-lg font-bold">
                          Ficha privada
                        </h2>
                        {role === "guardian" ? (
                          <ProfileForm
                            key={profileId}
                            detail={detail}
                            save={save}
                          />
                        ) : (
                          <dl className="grid gap-5 sm:grid-cols-2">
                            {[
                              ["Nombre completo", detail.profile.fullName],
                              ["Edad", detail.profile.age],
                              [
                                "Necesidades de apoyo",
                                detail.profile.supportLevel,
                              ],
                              ["Contexto", detail.profile.mainContext],
                              [
                                "Antecedentes",
                                detail.profile.notes ||
                                  "Sin antecedentes registrados",
                              ],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <dt className="text-sm text-stone-500">{k}</dt>
                                <dd className="mt-1 whitespace-pre-wrap font-medium">
                                  {v}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </section>
                    )}
                    {active === "reports" && (
                      <>
                        {role === "therapist" && (
                          <section className={panel}>
                            <h2 className="mb-5 text-lg font-bold">
                              Nuevo informe del especialista
                            </h2>
                            <ReportForm
                              key={profileId}
                              profileId={profileId}
                              save={save}
                            />
                          </section>
                        )}
                        <section className={panel}>
                          <h2 className="mb-5 text-lg font-bold">
                            {role === "teacher"
                              ? "Orientaciones para acompañar la comunicación"
                              : "Evaluaciones y orientaciones"}
                          </h2>
                          {!detail.reports.length ? (
                            <p className="text-sm text-stone-500">
                              {role === "teacher"
                                ? "El especialista aún no ha compartido orientaciones."
                                : "No hay informes publicados para este niño."}
                            </p>
                          ) : (
                            <div className="grid gap-5">
                              {detail.reports.map((r) => (
                                <article
                                  key={r.id}
                                  className="rounded-xl border border-stone-200 p-5"
                                >
                                  <p className="text-xs text-stone-500">
                                    {new Date(r.createdAt).toLocaleDateString(
                                      "es-CL",
                                    )}{" "}
                                    · {r.author}
                                  </p>
                                  {sensitive && (
                                    <>
                                      <h3 className="mt-4 font-bold">
                                        Diagnóstico y evaluación
                                      </h3>
                                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                                        {r.diagnosis}
                                      </p>
                                    </>
                                  )}
                                  {r.guidance && (
                                    <>
                                      <h3 className="mt-4 font-bold text-emerald-800">
                                        Orientaciones de comunicación
                                      </h3>
                                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                                        {r.guidance}
                                      </p>
                                    </>
                                  )}
                                </article>
                              ))}
                            </div>
                          )}
                        </section>
                      </>
                    )}
                    {active === "devices" &&
                      sensitive &&
                      (detail.overview ? (
                        <DevicesView
                          device={detail.overview.device}
                          hasDeviceData={
                            detail.overview.device.status === "connected"
                          }
                          onEventSaved={() => void load()}
                        />
                      ) : (
                        <p className={panel}>
                          Todavía no hay un dispositivo asociado.
                        </p>
                      ))}
                    {active === "progress" &&
                      sensitive &&
                      (detail.overview ? (
                        <ProgressView data={detail.overview} />
                      ) : (
                        <p className={panel}>
                          Sin datos de dispositivo todavía.
                        </p>
                      ))}
                    {active === "history" && sensitive && (
                      <PaginatedHistory
                        key={profileId}
                        profileId={profileId}
                        token={session?.token ?? ""}
                      />
                    )}
                  </>
                )}
                {data.settings.supportEmail && (
                  <footer className="py-4 text-center text-xs text-stone-500">
                    ¿Necesitas ayuda?{" "}
                    <a
                      className="underline"
                      href={`mailto:${data.settings.supportEmail}`}
                    >
                      {data.settings.supportEmail}
                    </a>
                  </footer>
                )}
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}
