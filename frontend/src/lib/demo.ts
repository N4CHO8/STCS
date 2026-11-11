import type { AuthSession } from "./auth";
import {
  ADULT_ROLES,
  ROLE_NAMES,
  canReadSensitive,
  canEditBoard,
  isAdultRole,
  type AdultRole,
} from "./permissions";
import {
  DEVICE_PICTOGRAM_ASSETS,
  DEVICE_CATEGORIES,
  DEVICE_IMAGE_PATHS,
} from "./pictogramCatalog";
import type { ManagedUser, PortalData, Report } from "../types/portal";
import type {
  DeviceEvent,
  PictogramConfig,
  StudentProfile,
} from "../types/stcs";

export type PortalDemo = {
  session: AuthSession;
  request: typeof fetch;
  onExit: () => void;
};
type DemoStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type DemoChild = StudentProfile & {
  number: number;
  notes: string;
  board: PictogramConfig[];
  reports: (Report & { requestId?: string })[];
  events: DeviceEvent[];
};
type DemoState = {
  version: 1;
  settings: PortalData["settings"];
  users: ManagedUser[];
  children: DemoChild[];
};
const KEY = "stcs-demo-v1";

/** Only synthetic data lives under this key. Never read or replace the production session. */
function initialState(): DemoState {
  const now = new Date().toISOString();
  const children: DemoChild[] = ["Alex", "Luna"].map((name, i) => ({
    id: `d0000000-0000-4000-8000-00000000000${i + 1}`,
    childUserId: `demo-child-${i + 1}`,
    number: i + 1,
    displayName: `${name} Ejemplo`,
    age: 8 + i,
    supportLevel: "Ejemplo ficticio de apoyo visual",
    mainContext: "Entorno de demostración",
    notes:
      "Ficha ficticia para explorar la aplicación. No corresponde a una persona real.",
    board: DEVICE_PICTOGRAM_ASSETS.slice(0, 16).map((p) => ({
      ...p,
      id: `demo-${i}-${p.id}`,
    })),
    reports: [
      {
        id: `report-${i}`,
        createdAt: now,
        author: "Especialista demo",
        diagnosis:
          "Informe de ejemplo, sin valor clínico. En una cuenta real lo redacta el especialista asignado.",
        guidance:
          "Ofrecer tiempo para elegir un pictograma y confirmar el mensaje con calma.",
      },
    ],
    events: [0, 1, 2].map((n) => ({
      id: `event-${i}-${n}`,
      pictogramId: null,
      eventType: "pictogram_selected",
      actionLabel: ["Seleccionó Agua", "Seleccionó Ayuda", "Seleccionó Feliz"][
        n
      ],
      context: "Demostración",
      actorName: "ESP simulado",
      emotion: n === 2 ? "feliz" : null,
      intensity: null,
      occurredAt: new Date(Date.now() - n * 3600000).toISOString(),
      payload: {
        source: "demo",
        category: n === 2 ? "Emociones" : "Necesidades",
      },
    })),
  }));
  return {
    version: 1,
    settings: { appTitle: "STCS · Demo", supportEmail: "" },
    children,
    users: ADULT_ROLES.map((role) => ({
      id: `demo-${role}`,
      fullName: `${ROLE_NAMES[role]} demo`,
      email: `${role}@demo.invalid`,
      role,
      active: true,
      profileIds:
        role === "admin"
          ? []
          : children.slice(0, role === "guardian" ? 1 : 2).map((c) => c.id),
      pendingProfileIds: [],
    })),
  };
}
function read(storage: DemoStorage): DemoState {
  const raw = storage.getItem(KEY);
  if (raw) {
    try {
      const value = JSON.parse(raw);
      if (
        value.version === 1 &&
        Array.isArray(value.users) &&
        Array.isArray(value.children)
      )
        return value;
    } catch {
      /* A damaged demo can always be reset without touching real data. */
    }
  }
  const state = initialState();
  storage.setItem(KEY, JSON.stringify(state));
  return state;
}
export function resetDemo(storage: DemoStorage) {
  storage.removeItem(KEY);
}
function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}
function text(value: unknown, max: number, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    fail("Revisa los campos del formulario.");
  return (value as string).trim();
}

/** This is a local simulation, not an authentication provider. It never forwards a request to a server. */
export function createDemo(
  role: AdultRole,
  storage: DemoStorage,
  onExit: () => void,
): PortalDemo {
  const now = new Date().toISOString();
  const session: AuthSession = {
    token: "demo-only-no-server-session",
    expiresIn: "demo",
    user: {
      id: `demo-${role}`,
      fullName: `${ROLE_NAMES[role]} demo`,
      email: `${role}@demo.invalid`,
      role,
      createdAt: now,
      updatedAt: now,
    },
  };
  const request: typeof fetch = async (input, options) => {
    try {
      const url = new URL(
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
        "https://demo.invalid",
      );
      if (url.origin !== "https://demo.invalid")
        fail("La demo no realiza conexiones externas.", 403);
      const state = read(storage),
        actor = state.users.find((u) => u.id === session.user.id);
      if (!actor?.active)
        fail(
          "Esta cuenta demo está desactivada. Reinicia los datos o cambia de perfil.",
          403,
        );
      const headers = new Headers(options?.headers),
        selected =
          url.searchParams.get("profileId") ?? headers.get("x-stcs-profile-id");
      const allowed = actor.profileIds.filter(
        (id) => !actor.pendingProfileIds?.includes(id),
      );
      const child = state.children.find(
        (c) => c.id === (selected ?? allowed[0]),
      );
      const currentRole = actor.role;
      const clinical = () => {
        if (!canReadSensitive(currentRole))
          fail("Este perfil no tiene acceso a información sensible.", 403);
      };
      const assigned = () => {
        if (currentRole === "admin" || !child || !allowed.includes(child.id))
          fail("Perfil sin acceso a este niño.", 403);
        return child!;
      };
      const method = options?.method ?? "GET";
      let body: Record<string, unknown> = {};
      if (options?.body) {
        body = JSON.parse(String(options.body));
        if (!body || typeof body !== "object" || Array.isArray(body))
          fail("Solicitud inválida.");
      }
      let result: unknown;
      let status = 200;
      if (url.pathname === "/api/stcs/portal" && method === "GET") {
        const data: PortalData = {
          role: currentRole,
          settings: state.settings,
          profiles: state.children
            .filter((c) => currentRole === "admin" || allowed.includes(c.id))
            .map((c) => ({
              id: c.id,
              number: c.number,
              label:
                currentRole === "admin"
                  ? `Usuario ${c.number}`
                  : currentRole === "teacher"
                    ? c.displayName.split(" ")[0]
                    : c.displayName,
            })),
        };
        if (currentRole === "admin") data.users = state.users;
        else {
          if (selected && !allowed.includes(selected))
            fail("Perfil sin acceso a este niño.", 403);
          if (child && allowed.includes(child.id)) {
            const c = assigned(),
              sensitive = canReadSensitive(currentRole),
              summary = data.profiles.find((p) => p.id === c.id)!;
            data.detail = {
              profile: {
                ...summary,
                ...(sensitive
                  ? {
                      fullName: c.displayName,
                      age: c.age,
                      supportLevel: c.supportLevel,
                      mainContext: c.mainContext,
                      notes: c.notes,
                    }
                  : {}),
              },
              pictograms: c.board,
              reports: c.reports
                .map((r) => ({
                  id: r.id,
                  author: r.author,
                  createdAt: r.createdAt,
                  guidance: r.guidance,
                  ...(sensitive ? { diagnosis: r.diagnosis } : {}),
                }))
                .filter((r) => sensitive || r.guidance),
            };
            if (sensitive)
              data.detail.overview = {
                user: { id: actor.id, name: actor.fullName, role: currentRole },
                profile: {
                  id: c.id,
                  childUserId: c.childUserId,
                  displayName: c.displayName,
                  age: c.age,
                  supportLevel: c.supportLevel,
                  mainContext: c.mainContext,
                },
                device: {
                  id: "demo-device",
                  code: "ESP-DEMO",
                  name: "Comunicador simulado",
                  status: "connected",
                  batteryLevel: 85,
                  wifiSsid: "Red simulada",
                  firmwareVersion: "Demo",
                  lastSyncAt: new Date().toISOString(),
                },
                pictograms: c.board,
                metrics: {
                  interactionsToday: 3,
                  emotionsToday: 1,
                  deviceStatus: "connected",
                },
                weeklyUse: [
                  "Lun",
                  "Mar",
                  "Mié",
                  "Jue",
                  "Vie",
                  "Sáb",
                  "Dom",
                ].map((day, i) => ({ day, interactions: 2 + i })),
                categoryUse: [
                  { name: "Necesidades", value: 2 },
                  { name: "Emociones", value: 1 },
                ],
                emotionProgress: [
                  { day: "01", positive: 2, difficult: 1 },
                  { day: "06", positive: 3, difficult: 1 },
                  { day: "11", positive: 4, difficult: 2 },
                ],
                recentActivity: c.events,
              };
          }
          if (canReadSensitive(currentRole))
            data.pendingApprovals = state.users.flatMap((u) =>
              (u.pendingProfileIds ?? [])
                .filter((id) => allowed.includes(id) && u.id !== actor.id)
                .map((id) => ({
                  profileId: id,
                  number: state.children.find((c) => c.id === id)!.number,
                  actorId: u.id,
                  name: u.fullName,
                  email: u.email,
                  role: u.role,
                })),
            );
        }
        result = { data };
      } else if (url.pathname === "/api/stcs/portal" && method === "POST") {
        if (body.action === "profile") {
          if (currentRole !== "guardian")
            fail("Solo el apoderado edita la ficha.", 403);
          const c = state.children.find((c) => c.id === body.profileId);
          if (!c || !allowed.includes(c.id)) fail("Perfil sin acceso.", 403);
          const age = Number(body.age);
          if (!Number.isInteger(age) || age < 1 || age > 18)
            fail("Edad entre 1 y 18 años.");
          Object.assign(c, {
            displayName: text(body.fullName, 120, true),
            age,
            supportLevel: text(body.supportLevel, 120, true),
            mainContext: text(body.mainContext, 80, true),
            notes: text(body.notes, 5000),
          });
        } else if (body.action === "report") {
          if (currentRole !== "therapist")
            fail("Solo el especialista publica informes.", 403);
          const c = state.children.find((c) => c.id === body.profileId);
          if (!c || !allowed.includes(c.id)) fail("Perfil sin acceso.", 403);
          const diagnosis = text(body.diagnosis, 10000, true),
            guidance = text(body.guidance, 3000),
            requestId = text(body.requestId, 100, true);
          if (!c.reports.some((r) => r.requestId === requestId))
            c.reports.unshift({
              id: crypto.randomUUID(),
              author: actor.fullName,
              createdAt: new Date().toISOString(),
              diagnosis,
              guidance,
              requestId,
            });
        } else if (body.action === "approval") {
          clinical();
          if (
            body.actorId === actor.id ||
            !allowed.includes(String(body.profileId))
          )
            fail("No puedes aprobar esta solicitud.", 403);
          const u = state.users.find((u) => u.id === body.actorId);
          if (!u) fail("Cuenta no encontrada.");
          u.pendingProfileIds = u.pendingProfileIds?.filter(
            (id) => id !== body.profileId,
          );
          if (!body.approve)
            u.profileIds = u.profileIds.filter((id) => id !== body.profileId);
        } else {
          if (currentRole !== "admin")
            fail("Acción exclusiva de administración.", 403);
          if (body.action === "settings")
            state.settings = {
              appTitle: text(body.appTitle, 80, true),
              supportEmail: text(body.supportEmail, 120),
            };
          else if (body.action === "user") {
            if (!isAdultRole(String(body.role))) fail("Rol inválido.");
            const targetRole = body.role as AdultRole,
              ids = Array.isArray(body.profileIds)
                ? [...new Set(body.profileIds.map(String))]
                : [];
            if (
              ids.some((id) => !state.children.some((c) => c.id === id)) ||
              (targetRole === "guardian" && ids.length > 1) ||
              (targetRole === "admin" && ids.length)
            )
              fail("Asignaciones inválidas.");
            const email = text(body.email, 120, true).toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
              fail("Correo inválido.");
            if (state.users.some((u) => u.email === email && u.id !== body.id))
              fail("Ya existe ese correo demo.", 409);
            const old = state.users.find((u) => u.id === body.id);
            if (body.id && !old) fail("Cuenta no encontrada.");
            if (old && old.email !== email)
              fail(
                "El correo de una cuenta existente no se cambia desde administración.",
                403,
              );
            if (
              body.id === actor.id &&
              (targetRole !== "admin" || !body.active)
            )
              fail("No puedes desactivar tu propia administración.", 403);
            const next: ManagedUser = {
              id: old?.id ?? crypto.randomUUID(),
              fullName: text(body.fullName, 120, true),
              email,
              role: targetRole,
              active: body.active === true,
              profileIds: ids,
              pendingProfileIds: canReadSensitive(targetRole)
                ? ids.filter(
                    (id) =>
                      old?.role !== targetRole ||
                      !old.profileIds.includes(id) ||
                      old.pendingProfileIds?.includes(id),
                  )
                : [],
            };
            if (old) state.users[state.users.indexOf(old)] = next;
            else state.users.push(next);
          } else fail("Acción no disponible en esta demo.");
        }
        result = {
          message: "Cambios de demostración guardados en este navegador.",
        };
      } else if (url.pathname === "/api/stcs/events" && method === "GET") {
        clinical();
        const c = assigned(),
          offset = Number(url.searchParams.get("offset") ?? 0);
        if (!Number.isSafeInteger(offset) || offset < 0)
          fail("Página inválida.");
        result = {
          data: c.events.slice(offset, offset + 100),
          total: c.events.length,
          hasMore: offset + 100 < c.events.length,
        };
      } else if (
        url.pathname.startsWith("/api/stcs/pictograms") &&
        ["POST", "PUT", "DELETE"].includes(method)
      ) {
        if (!canEditBoard(currentRole))
          fail("Solo el especialista o docente edita el tablero.", 403);
        const c = assigned(),
          id = url.pathname.split("/")[4],
          old = c.board.find((p) => p.id === id);
        if (method !== "POST" && !old) fail("Pictograma no encontrado.", 404);
        if (method === "DELETE") c.board = c.board.filter((p) => p.id !== id);
        else {
          const label = text(body.label, 31, true),
            message = text(body.message, 95, true),
            category = text(body.category, 60, true),
            imagePath = text(body.imagePath, 255, true);
          if (
            new TextEncoder().encode(label).length > 31 ||
            new TextEncoder().encode(message).length > 95
          )
            fail("El texto supera la capacidad del ESP.");
          if (
            !DEVICE_CATEGORIES.includes(
              category as (typeof DEVICE_CATEGORIES)[number],
            ) ||
            !DEVICE_IMAGE_PATHS.has(imagePath)
          )
            fail("Selecciona una imagen y categoría del catálogo.");
          if (
            c.board.filter((p) => p.category === category && p.id !== id)
              .length >= 8
          )
            fail("Máximo ocho pictogramas por categoría.", 409);
          if (
            c.board.some(
              (p) =>
                p.id !== id &&
                p.category === category &&
                p.label.toLowerCase() === label.toLowerCase(),
            )
          )
            fail("Ya existe ese pictograma.", 409);
          const next: PictogramConfig = {
            id: old?.id ?? crypto.randomUUID(),
            label,
            message,
            category,
            imagePath,
            colorTone: text(body.colorTone, 40, true),
            iconName: text(body.iconName, 60, true),
            position: Number(body.position) || 1,
          };
          if (old) c.board[c.board.indexOf(old)] = next;
          else c.board.push(next);
          result = { data: next };
          status = old ? 200 : 201;
        }
      } else
        fail(
          "Ruta fuera de la simulación. No se enviaron datos a ningún servidor.",
          404,
        );
      if (method !== "GET") storage.setItem(KEY, JSON.stringify(state));
      return Response.json(result ?? { message: "Cambio demo guardado." }, {
        status,
      });
    } catch (error) {
      return Response.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "No se pudo cargar la demo.",
        },
        { status: (error as { status?: number })?.status ?? 503 },
      );
    }
  };
  return { session, request, onExit };
}
