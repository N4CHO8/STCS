"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Battery,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  LineChart as LineChartIcon,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Smile,
  Trash2,
  Watch,
  Wifi,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatDateTime,
  hasEmotionData,
  hasWeeklyData,
  isDeviceOnline,
  type Pictogram,
} from "@/lib/stcsUi";
import {
  DEVICE_CATEGORIES,
  DEVICE_ITEMS_PER_PAGE,
  DEVICE_MAX_PICTOGRAMS,
  DEVICE_PICTOGRAM_ASSETS,
  type DeviceCategory,
} from "@/lib/pictogramCatalog";
import type {
  DeviceEvent,
  DeviceInfo,
  PictogramConfig,
  StcsOverview,
  TabId,
} from "@/types/stcs";
import { WifiDeviceProvisioner } from "./wifi-device-provisioner";

import {
  ActivityItem,
  Card,
  DeviceDetail,
  EditIconButton,
  EmptyState,
  MetricCard,
  PageHeader,
  SectionTitle,
  SmallButton,
  StatusPill,
} from "./shared";

export function DashboardView({
  data,
  name,
  onNavigate,
  embedded = false,
  canConfigureBoard = true,
}: {
  data: StcsOverview;
  name: string;
  onNavigate: (tab: TabId) => void;
  embedded?: boolean;
  canConfigureBoard?: boolean;
}) {
  const hasActivity = data.recentActivity.length > 0;
  const isConnected =
    hasActivity && isDeviceOnline(data.device.status, data.device.lastSyncAt);

  return (
    <div className="grid gap-6">
      {!embedded && (
        <PageHeader
          action={
            <StatusPill>
              <span
                className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-stone-300"}`}
              />
              {isConnected ? "ESP32 conectado" : "ESP32 pendiente"}
              <span className="mx-1 h-4 w-px bg-stone-200" />
              <Battery className="h-4 w-4" />
              {isConnected ? `${data.device.batteryLevel}%` : "Sin datos"}
            </StatusPill>
          }
          title={`Hola, ${name}`}
          subtitle="Resumen general"
        />
      )}

      <section className="grid gap-4 md:grid-cols-[260px_260px_1fr]">
        <MetricCard
          icon={MessageCircle}
          label="Interacciones hoy"
          value={
            hasActivity ? String(data.metrics.interactionsToday) : "Sin datos"
          }
        />
        <MetricCard
          icon={Smile}
          label="Emociones"
          value={hasActivity ? String(data.metrics.emotionsToday) : "Sin datos"}
        />
        <Card className="min-h-[162px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-500">
                Dispositivo ({data.device.name})
              </p>
              <p className="mt-2 text-base font-semibold text-stone-600">
                {isConnected
                  ? `Ultima sincronizacion ${formatDateTime(data.device.lastSyncAt)}`
                  : data.device.lastSyncAt
                    ? "Sin conexión reciente"
                    : "Sin sincronización"}
              </p>
            </div>
            <Watch className="h-16 w-16 text-stone-100" />
          </div>
          <div className="mt-6 flex gap-3">
            <SmallButton onClick={() => onNavigate("communicator")}>
              {canConfigureBoard ? "Editar tablero" : "Ver tablero"}
            </SmallButton>
            <SmallButton muted onClick={() => onNavigate("history")}>
              Ver actividad
            </SmallButton>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_345px]">
        <Card className="min-h-[352px]">
          <SectionTitle>Uso del comunicador esta semana</SectionTitle>
          {hasWeeklyData(data.weeklyUse) ? (
            <WeeklyUseChart data={data.weeklyUse} />
          ) : (
            <EmptyState icon={BarChart3} text="Sin datos del dispositivo" />
          )}
        </Card>
        <ActivityCard events={data.recentActivity} />
      </section>
    </div>
  );
}

export function CommunicatorView({
  onDeleted,
  onSaved,
  pictograms,
  token,
  profileId,
  request = fetch,
  demo = false,
}: {
  onDeleted: (pictogramId: string) => void;
  onSaved: (pictogram: PictogramConfig) => void;
  pictograms: Pictogram[];
  token: string;
  profileId: string;
  request?: typeof fetch;
  demo?: boolean;
}) {
  const [editing, setEditing] = useState<Pictogram | "new" | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<DeviceCategory>("Necesidades");
  const categoryPictograms = pictograms.filter(
    (item) => item.category === selectedCategory,
  );
  const pageCount = Math.max(
    1,
    Math.ceil(categoryPictograms.length / DEVICE_ITEMS_PER_PAGE),
  );
  const nextPosition = Math.min(
    DEVICE_MAX_PICTOGRAMS,
    Math.max(0, ...pictograms.map((item) => item.position)) + 1,
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        action={
          <SmallButton onClick={() => setEditing("new")}>
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar
            </span>
          </SmallButton>
        }
        title="Configuracion del Comunicador"
      />

      <section className="grid gap-7 lg:grid-cols-[340px_1fr]">
        <Card className="flex min-h-[520px] flex-col items-center">
          <SectionTitle>Vista previa en dispositivo</SectionTitle>
          <RoundDevice
            category={selectedCategory}
            pictograms={categoryPictograms}
          />
          <p className="mt-6 text-center text-sm font-medium text-stone-400">
            {demo
              ? "Vista simulada del tablero de comunicación"
              : "Esta es la misma categoria que recibira el ESP32"}
          </p>
        </Card>

        <div className="grid content-start gap-6">
          <Card>
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DEVICE_CATEGORIES.map((category) => (
                <button
                  className={`h-10 rounded-lg px-3 text-sm font-bold transition ${
                    category === selectedCategory
                      ? "bg-[#518b51] text-white"
                      : "border border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
                  }`}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <SectionTitle>Pictogramas activos</SectionTitle>
                <p className="mt-1 text-sm text-stone-400">
                  {categoryPictograms.length} pictogramas en {pageCount}{" "}
                  {pageCount === 1 ? "pagina" : "paginas"}
                </p>
              </div>
              <SmallButton onClick={() => setEditing("new")}>
                Agregar
              </SmallButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categoryPictograms.map((pictogram) => (
                <PictogramCard
                  key={pictogram.id}
                  onEdit={() => setEditing(pictogram)}
                  pictogram={pictogram}
                />
              ))}
            </div>
          </Card>

          <div className="flex items-center gap-3 border-t border-stone-200 pt-5 text-sm font-semibold text-stone-500">
            <Database className="h-4 w-4 text-[#518b51]" />
            {demo
              ? "Los cambios demo se guardan solo en este navegador y no se envían al ESP32."
              : "Cada cambio se guarda inmediatamente en Supabase y queda disponible para el ESP32."}
          </div>
        </div>
      </section>

      {editing ? (
        <PictogramEditor
          key={editing === "new" ? "new" : editing.id}
          onClose={() => setEditing(null)}
          onDeleted={(pictogramId) => {
            onDeleted(pictogramId);
            setEditing(null);
          }}
          onSaved={(pictogram) => {
            onSaved(pictogram);
            setEditing(null);
          }}
          pictogram={editing === "new" ? null : editing}
          suggestedPosition={nextPosition}
          token={token}
          profileId={profileId}
          request={request}
        />
      ) : null}
    </div>
  );
}

export function HistoryView({
  events,
  isRefreshing,
  onRefresh,
}: {
  events: DeviceEvent[];
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const [context, setContext] = useState("all");
  const [eventType, setEventType] = useState("all");
  const contexts = useMemo(
    () => Array.from(new Set(events.map((event) => event.context))).sort(),
    [events],
  );
  const eventTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.eventType))).sort(),
    [events],
  );
  const filteredEvents = events.filter(
    (event) =>
      (context === "all" || event.context === context) &&
      (eventType === "all" || event.eventType === eventType),
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <SmallButton disabled={isRefreshing} muted onClick={onRefresh}>
              <span className="inline-flex items-center gap-2">
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualizar
              </span>
            </SmallButton>
          </div>
        }
        subtitle="Eventos enviados por el dispositivo"
        title="Historial"
      />
      <Card className="min-h-[430px]">
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-stone-500">
            Contexto
            <select
              className="mt-2 h-10 w-full rounded-lg border border-stone-200 bg-white px-3"
              onChange={(event) => setContext(event.target.value)}
              value={context}
            >
              <option value="all">Todos</option>
              {contexts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-stone-500">
            Tipo de evento
            <select
              className="mt-2 h-10 w-full rounded-lg border border-stone-200 bg-white px-3"
              onChange={(event) => setEventType(event.target.value)}
              value={eventType}
            >
              <option value="all">Todos</option>
              {eventTypes.map((item) => (
                <option key={item} value={item}>
                  {formatEventType(item)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filteredEvents.length > 0 ? (
          <div className="grid gap-3">
            <p className="text-xs font-bold uppercase text-stone-400">
              {filteredEvents.length} eventos, del mas reciente al mas antiguo
            </p>
            {filteredEvents.map((event) => (
              <ActivityItem key={event.id} event={event} large />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            text="Sin registros del ESP32 para estos filtros"
          />
        )}
      </Card>
    </div>
  );
}

export function ProgressView({ data }: { data: StcsOverview }) {
  return (
    <div className="grid gap-6">
      <PageHeader title="Progreso" />
      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="min-h-[380px]">
          <SectionTitle>Uso por categoria</SectionTitle>
          {data.categoryUse.length > 0 ? (
            <CategoryUseChart data={data.categoryUse} />
          ) : (
            <EmptyState icon={BarChart3} text="Sin datos por categoria" />
          )}
        </Card>
        <Card className="min-h-[380px]">
          <SectionTitle>Registro emocional mensual</SectionTitle>
          {hasEmotionData(data.emotionProgress) ? (
            <EmotionProgressChart data={data.emotionProgress} />
          ) : (
            <EmptyState icon={LineChartIcon} text="Sin registros emocionales" />
          )}
        </Card>
      </section>
    </div>
  );
}

export function DevicesView({
  device,
  hasDeviceData,
  onEventSaved,
  demo = false,
}: {
  device: DeviceInfo;
  hasDeviceData: boolean;
  onEventSaved: () => void;
  demo?: boolean;
}) {
  const isConnected =
    hasDeviceData && isDeviceOnline(device.status, device.lastSyncAt);

  return (
    <div className="grid gap-6">
      <PageHeader title="Gestion de Dispositivos" />
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-500">
                Dispositivo actual
              </p>
              <h2 className="mt-2 font-display text-2xl font-black text-stone-600">
                {isConnected ? device.code : "Sin dispositivo sincronizado"}
              </h2>
            </div>
            <Watch className="h-14 w-14 text-stone-100" />
          </div>
          {isConnected ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <DeviceDetail
                icon={Battery}
                label="Bateria"
                value={`${device.batteryLevel}%`}
              />
              <DeviceDetail
                icon={Wifi}
                label="Red Wi-Fi"
                value={device.wifiSsid ?? "Sin datos"}
              />
              <DeviceDetail
                icon={Cpu}
                label="Firmware"
                value={device.firmwareVersion}
              />
              <DeviceDetail
                icon={Clock}
                label="Ultima conexion"
                value={formatDateTime(device.lastSyncAt)}
              />
            </div>
          ) : (
            <EmptyState icon={Watch} text="Pendiente de vinculacion" />
          )}
        </Card>
        <Card className="grid min-h-[260px] content-center">
          {demo ? (
            <p className="p-5 text-sm text-stone-600">
              Dispositivo simulado. La demo no conecta hardware ni envía eventos
              reales.
            </p>
          ) : (
            <WifiDeviceProvisioner onConfigured={onEventSaved} />
          )}
        </Card>
      </section>
    </div>
  );
}

function ActivityCard({ events }: { events: DeviceEvent[] }) {
  return (
    <Card className="min-h-[352px]">
      <SectionTitle>Actividad reciente</SectionTitle>
      {events.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {events.slice(0, 3).map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Clock} text="Sin actividad registrada" />
      )}
    </Card>
  );
}

function WeeklyUseChart({ data }: { data: StcsOverview["weeklyUse"] }) {
  return (
    <div className="mt-5 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="day" stroke="#a8a29e" />
          <YAxis stroke="#a8a29e" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="interactions"
            name="Interacciones"
            stroke="#518b51"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryUseChart({ data }: { data: StcsOverview["categoryUse"] }) {
  return (
    <div className="mt-6 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis type="number" stroke="#a8a29e" />
          <YAxis dataKey="name" type="category" stroke="#a8a29e" width={100} />
          <Tooltip />
          <Bar
            dataKey="value"
            name="Usos"
            fill="#518b51"
            radius={[0, 9, 9, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmotionProgressChart({
  data,
}: {
  data: StcsOverview["emotionProgress"];
}) {
  return (
    <div className="mt-6 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="day" stroke="#a8a29e" />
          <YAxis stroke="#a8a29e" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="positive"
            name="Feliz/Tranquilo"
            stroke="#518b51"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="difficult"
            name="Malestar/Cansancio"
            stroke="#f59e0b"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLOR_OPTIONS = [
  { value: "amber", className: "bg-amber-400" },
  { value: "blue", className: "bg-blue-500" },
  { value: "cyan", className: "bg-cyan-500" },
  { value: "emerald", className: "bg-emerald-500" },
  { value: "indigo", className: "bg-indigo-500" },
  { value: "orange", className: "bg-orange-500" },
  { value: "rose", className: "bg-rose-500" },
  { value: "sage", className: "bg-emerald-300" },
  { value: "sky", className: "bg-sky-400" },
  { value: "violet", className: "bg-violet-500" },
  { value: "yellow", className: "bg-yellow-400" },
];

function PictogramEditor({
  onClose,
  onDeleted,
  onSaved,
  pictogram,
  suggestedPosition,
  token,
  profileId,
  request = fetch,
}: {
  onClose: () => void;
  onDeleted: (pictogramId: string) => void;
  onSaved: (pictogram: PictogramConfig) => void;
  pictogram: Pictogram | null;
  suggestedPosition: number;
  token: string;
  profileId: string;
  request?: typeof fetch;
}) {
  const [form, setForm] = useState({
    label: pictogram?.label ?? "",
    message: pictogram?.message ?? "",
    category: pictogram?.category ?? "Necesidades",
    colorTone: pictogram?.colorTone ?? "sky",
    iconName: pictogram?.iconName ?? "MessageCircle",
    imagePath: pictogram?.imagePath ?? "",
    position: pictogram?.position ?? suggestedPosition,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const imageOptions = DEVICE_PICTOGRAM_ASSETS.filter(
    (item) => item.category === form.category,
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await request(
        pictogram
          ? `/api/stcs/pictograms/${pictogram.id}`
          : "/api/stcs/pictograms",
        {
          method: pictogram ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-stcs-profile-id": profileId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );
      const payload = (await response.json()) as {
        data?: PictogramConfig;
        message?: string;
      };

      if (!response.ok || !payload.data) {
        setErrorMessage(
          payload.message ?? "No fue posible guardar el pictograma.",
        );
        return;
      }

      onSaved(payload.data);
    } catch {
      setErrorMessage("No fue posible conectar con la API.");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (
      !pictogram ||
      !window.confirm(`Eliminar ${pictogram.label} del tablero?`)
    ) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await request(`/api/stcs/pictograms/${pictogram.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-stcs-profile-id": profileId,
        },
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setErrorMessage(
          payload.message ?? "No fue posible eliminar el pictograma.",
        );
        return;
      }

      onDeleted(pictogram.id);
    } catch {
      setErrorMessage("No fue posible conectar con la API.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        aria-labelledby="pictogram-editor-title"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-xl font-black text-stone-700"
              id="pictogram-editor-title"
            >
              {pictogram ? "Editar pictograma" : "Agregar pictograma"}
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Configuracion asociada al perfil del nino
            </p>
          </div>
          <button
            aria-label="Cerrar"
            className="rounded-lg p-2 hover:bg-stone-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 grid gap-5" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nombre"
              maxLength={31}
              onChange={(value) => setForm({ ...form, label: value })}
              value={form.label}
            />
            <label className="text-sm font-semibold text-stone-600">
              Categoria
              <select
                className="mt-2 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 font-normal"
                onChange={(event) => {
                  const category = event.target.value as DeviceCategory;
                  const firstAsset = DEVICE_PICTOGRAM_ASSETS.find(
                    (item) => item.category === category,
                  );
                  setForm({
                    ...form,
                    category,
                    imagePath: firstAsset?.imagePath ?? "",
                    iconName: firstAsset?.iconName ?? "MessageCircle",
                  });
                }}
                value={form.category}
              >
                {DEVICE_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <TextField
            label="Frase asociada"
            maxLength={95}
            onChange={(value) => setForm({ ...form, message: value })}
            value={form.message}
          />

          <fieldset>
            <legend className="text-sm font-semibold text-stone-600">
              Imagen CAA
            </legend>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {imageOptions.map((option) => (
                <button
                  aria-label={`Usar imagen ${option.label}`}
                  aria-pressed={form.imagePath === option.imagePath}
                  className={`grid aspect-square place-items-center rounded-lg border p-1 transition ${
                    form.imagePath === option.imagePath
                      ? "border-[#518b51] ring-2 ring-emerald-100"
                      : "border-stone-200"
                  }`}
                  key={option.imagePath}
                  onClick={() =>
                    setForm({
                      ...form,
                      label: form.label || option.label,
                      message: form.message || option.message,
                      imagePath: option.imagePath,
                      iconName: option.iconName,
                    })
                  }
                  type="button"
                >
                  <img
                    alt={option.label}
                    className="h-full w-full object-contain"
                    src={option.imagePath}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-stone-600">
              Color de apoyo
            </legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((option) => (
                <button
                  aria-label={`Color ${option.value}`}
                  aria-pressed={form.colorTone === option.value}
                  className={`h-8 w-8 rounded-full ${option.className} ${
                    form.colorTone === option.value
                      ? "ring-2 ring-stone-700 ring-offset-2"
                      : ""
                  }`}
                  key={option.value}
                  onClick={() => setForm({ ...form, colorTone: option.value })}
                  type="button"
                >
                  {form.colorTone === option.value ? (
                    <Check className="mx-auto h-4 w-4 text-white" />
                  ) : null}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="text-sm font-semibold text-stone-600">
            Posicion
            <input
              className="mt-2 h-11 w-28 rounded-lg border border-stone-200 px-3"
              max={DEVICE_MAX_PICTOGRAMS}
              min={1}
              onChange={(event) =>
                setForm({ ...form, position: Number(event.target.value) })
              }
              type="number"
              value={form.position}
            />
          </label>

          {errorMessage ? (
            <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-stone-200 pt-5">
            {pictogram ? (
              <button
                className="mr-auto inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
                disabled={isSaving}
                onClick={() => void remove()}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            ) : null}
            <SmallButton muted onClick={onClose}>
              Cancelar
            </SmallButton>
            <SmallButton disabled={isSaving} type="submit">
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar"}
              </span>
            </SmallButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  label,
  maxLength,
  onChange,
  value,
}: {
  label: string;
  maxLength: number;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-sm font-semibold text-stone-600">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-lg border border-stone-200 px-3 font-normal"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        required
        value={value}
      />
    </label>
  );
}

const formatEventType = (eventType: string) => {
  const labels: Record<string, string> = {
    audio_started: "Audio reproducido",
    audio_completed: "Audio completado",
    audio_requested: "Audio solicitado",
    board_synced: "Tablero sincronizado",
    category_opened: "Categoria abierta",
    device_error: "Error del dispositivo",
    device_started: "Dispositivo iniciado",
    device_status: "Estado del dispositivo",
    emotion_recorded: "Emocion registrada",
    phrase_played: "Frase reproducida",
    phrase_cleared: "Frase limpiada",
    pictogram_selected: "Pictograma seleccionado",
    navigation: "Navegacion",
    ui_ready: "Interfaz iniciada",
    sync_completed: "Sincronizacion completada",
  };

  return labels[eventType] ?? eventType;
};

function RoundDevice({
  category,
  pictograms,
}: {
  category: string;
  pictograms: Pictogram[];
}) {
  const [page, setPage] = useState(0);
  const touchStart = useRef<number | null>(null);
  const pageCount = Math.max(
    1,
    Math.ceil(pictograms.length / DEVICE_ITEMS_PER_PAGE),
  );
  const pages = Array.from({ length: pageCount }, (_, index) =>
    pictograms.slice(
      index * DEVICE_ITEMS_PER_PAGE,
      (index + 1) * DEVICE_ITEMS_PER_PAGE,
    ),
  );

  useEffect(() => {
    setPage(0);
  }, [category, pictograms.length]);

  const movePage = (direction: number) => {
    setPage((current) =>
      Math.min(pageCount - 1, Math.max(0, current + direction)),
    );
  };

  return (
    <div className="mt-8 grid aspect-square w-[250px] place-items-center rounded-full border-[10px] border-black bg-white p-6 shadow-xl md:w-[280px]">
      <div className="grid h-full w-full grid-rows-[24px_1fr_18px] gap-2 overflow-hidden rounded-full bg-white">
        <p className="text-center text-xs font-black text-stone-500">
          {category}
        </p>
        <div
          className="overflow-hidden"
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const distance =
              event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(distance) >= 30) movePage(distance < 0 ? 1 : -1);
            touchStart.current = null;
          }}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0].clientX;
          }}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((items, pageIndex) => (
              <div
                className="grid h-full min-w-full grid-cols-2 gap-2"
                key={`${category}-${pageIndex}`}
              >
                {items.map((pictogram) => {
                  const Icon = pictogram.icon;

                  return (
                    <div
                      className={`grid place-items-center rounded-lg text-center ${pictogram.tone}`}
                      key={pictogram.id}
                    >
                      {pictogram.imagePath ? (
                        <img
                          alt=""
                          className="h-11 w-11 object-contain"
                          src={pictogram.imagePath}
                        />
                      ) : (
                        <Icon className="h-7 w-7" />
                      )}
                      <span className="text-[10px] font-black">
                        {pictogram.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            aria-label="Pagina anterior"
            className="text-stone-500 disabled:text-stone-200"
            disabled={page === 0}
            onClick={() => movePage(-1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pages.map((_, index) => (
            <span
              className={`h-2 w-2 rounded-full ${index === page ? "bg-[#518b51]" : "bg-stone-300"}`}
              key={index}
            />
          ))}
          <button
            aria-label="Pagina siguiente"
            className="text-stone-500 disabled:text-stone-200"
            disabled={page === pageCount - 1}
            onClick={() => movePage(1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PictogramCard({
  onEdit,
  pictogram,
}: {
  onEdit: () => void;
  pictogram: Pictogram;
}) {
  const Icon = pictogram.icon;

  return (
    <article className="relative grid min-h-[150px] place-items-center rounded-xl border border-stone-200 bg-white p-4 text-center">
      <EditIconButton label={`Editar ${pictogram.label}`} onClick={onEdit} />
      <span
        className={`grid h-20 w-20 place-items-center rounded-lg ${pictogram.tone}`}
      >
        {pictogram.imagePath ? (
          <img
            alt=""
            className="h-16 w-16 object-contain"
            src={pictogram.imagePath}
          />
        ) : (
          <Icon className="h-8 w-8" />
        )}
      </span>
      <div>
        <strong className="block text-sm font-black text-stone-600">
          {pictogram.label}
        </strong>
        <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
          {pictogram.category}
        </span>
      </div>
    </article>
  );
}
