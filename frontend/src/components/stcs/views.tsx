import {
  BarChart3,
  Battery,
  Calendar,
  Clock,
  Cpu,
  LineChart as LineChartIcon,
  MapPin,
  MessageCircle,
  Smile,
  Watch,
  Wifi
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
  YAxis
} from "recharts";

import {
  formatDateTime,
  hasEmotionData,
  hasWeeklyData,
  type Pictogram
} from "@/lib/stcsUi";
import type { DeviceEvent, DeviceInfo, StcsOverview } from "@/types/stcs";

import {
  ActivityItem,
  AddSpaceButton,
  Card,
  DeviceDetail,
  EditIconButton,
  EmptyState,
  FilterButton,
  MetricCard,
  PageHeader,
  SectionTitle,
  SmallButton,
  StatusPill
} from "./shared";

export function DashboardView({ data, name }: { data: StcsOverview; name: string }) {
  const hasActivity = data.recentActivity.length > 0;
  const isConnected =
    hasActivity && data.device.status === "connected" && Boolean(data.device.lastSyncAt);

  return (
    <div className="grid gap-6">
      <PageHeader
        action={
          <StatusPill>
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-stone-300"}`} />
            {isConnected ? "ESP32 conectado" : "ESP32 pendiente"}
            <span className="mx-1 h-4 w-px bg-stone-200" />
            <Battery className="h-4 w-4" />
            {isConnected ? `${data.device.batteryLevel}%` : "Sin datos"}
          </StatusPill>
        }
        title={`Hola, ${name}`}
        subtitle="Resumen general"
      />

      <section className="grid gap-4 md:grid-cols-[260px_260px_1fr]">
        <MetricCard
          icon={MessageCircle}
          label="Interacciones hoy"
          value={hasActivity ? String(data.metrics.interactionsToday) : "Sin datos"}
        />
        <MetricCard
          icon={Smile}
          label="Emociones"
          value={hasActivity ? String(data.metrics.emotionsToday) : "Sin datos"}
        />
        <Card className="min-h-[162px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-500">Dispositivo ({data.device.name})</p>
              <p className="mt-2 text-base font-semibold text-stone-600">
                {isConnected ? `Ultima sincronizacion ${formatDateTime(data.device.lastSyncAt)}` : "Sin sincronizacion"}
              </p>
            </div>
            <Watch className="h-16 w-16 text-stone-100" />
          </div>
          <div className="mt-6 flex gap-3">
            <SmallButton>Editar tablero</SmallButton>
            <SmallButton muted>Ver actividad</SmallButton>
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

export function CommunicatorView({ pictograms }: { pictograms: Pictogram[] }) {
  const visiblePictograms = pictograms.slice(0, 6);
  const previewPictograms = pictograms.slice(0, 4);

  return (
    <div className="grid gap-6">
      <PageHeader action={<SmallButton>Agregar nuevo</SmallButton>} title="Configuracion del Comunicador" />

      <section className="grid gap-7 lg:grid-cols-[340px_1fr]">
        <Card className="flex min-h-[630px] flex-col items-center">
          <SectionTitle>Vista previa en dispositivo</SectionTitle>
          <RoundDevice pictograms={previewPictograms} />
          <div className="mt-7 flex gap-3">
            <SmallButton muted>Anterior</SmallButton>
            <SmallButton muted>Siguiente</SmallButton>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <div className="mb-5 flex items-center justify-between gap-4">
              <SectionTitle>Pictogramas Activos</SectionTitle>
              <SmallButton>Agregar nuevo</SmallButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visiblePictograms.map((pictogram) => (
                <PictogramCard key={pictogram.id} pictogram={pictogram} />
              ))}
              <AddSpaceButton />
            </div>
          </Card>

          <Card>
            <SectionTitle>Sincronizacion</SectionTitle>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-[#fbfbf9] px-4 py-4">
              <span className="text-sm font-semibold text-stone-500">Cambios sin guardar</span>
              <SmallButton>Sincronizar</SmallButton>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export function HistoryView({ events }: { events: DeviceEvent[] }) {
  return (
    <div className="grid gap-6">
      <PageHeader title="Historial" />
      <Card className="min-h-[430px]">
        <div className="mb-5 flex flex-wrap gap-3">
          <FilterButton icon={Calendar}>Fecha</FilterButton>
          <FilterButton icon={MapPin}>Contexto</FilterButton>
        </div>
        {events.length > 0 ? (
          <div className="grid gap-3">
            {events.map((event) => (
              <ActivityItem key={event.id} event={event} large />
            ))}
          </div>
        ) : (
          <EmptyState icon={Clock} text="Sin registros del ESP32" />
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
  hasDeviceData
}: {
  device: DeviceInfo;
  hasDeviceData: boolean;
}) {
  const isConnected =
    hasDeviceData && device.status === "connected" && Boolean(device.lastSyncAt);

  return (
    <div className="grid gap-6">
      <PageHeader title="Gestion de Dispositivos" />
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-500">Dispositivo actual</p>
              <h2 className="mt-2 font-display text-2xl font-black text-stone-600">
                {isConnected ? device.code : "Sin dispositivo sincronizado"}
              </h2>
            </div>
            <Watch className="h-14 w-14 text-stone-100" />
          </div>
          {isConnected ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <DeviceDetail icon={Battery} label="Bateria" value={`${device.batteryLevel}%`} />
              <DeviceDetail icon={Wifi} label="Red Wi-Fi" value={device.wifiSsid ?? "Sin datos"} />
              <DeviceDetail icon={Cpu} label="Firmware" value={device.firmwareVersion} />
              <DeviceDetail icon={Clock} label="Ultima conexion" value={formatDateTime(device.lastSyncAt)} />
            </div>
          ) : (
            <EmptyState icon={Watch} text="Pendiente de vinculacion" />
          )}
        </Card>
        <LinkDeviceButton />
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
          <Bar dataKey="value" name="Usos" fill="#518b51" radius={[0, 9, 9, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmotionProgressChart({ data }: { data: StcsOverview["emotionProgress"] }) {
  return (
    <div className="mt-6 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="day" stroke="#a8a29e" />
          <YAxis stroke="#a8a29e" />
          <Tooltip />
          <Line type="monotone" dataKey="positive" name="Feliz/Tranquilo" stroke="#518b51" strokeWidth={3} />
          <Line type="monotone" dataKey="difficult" name="Frustrado/Ansioso" stroke="#f59e0b" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RoundDevice({ pictograms }: { pictograms: Pictogram[] }) {
  return (
    <div className="mt-8 grid aspect-square w-[250px] place-items-center rounded-full border-[10px] border-black bg-white p-6 shadow-xl md:w-[280px]">
      <div className="grid h-full w-full grid-rows-[24px_1fr_18px] gap-2 overflow-hidden rounded-full bg-white">
        <p className="text-center text-xs font-black text-stone-500">&iquest;Que quieres decir?</p>
        <div className="grid grid-cols-2 gap-2">
          {pictograms.map((pictogram) => {
            const Icon = pictogram.icon;

            return (
              <div
                className={`grid place-items-center rounded-xl text-center ${pictogram.tone}`}
                key={pictogram.id}
              >
                <Icon className="h-7 w-7" />
                <span className="mt-1 text-[10px] font-black">{pictogram.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#518b51]" />
          <span className="h-2 w-2 rounded-full bg-stone-300" />
          <span className="h-2 w-2 rounded-full bg-stone-300" />
        </div>
      </div>
    </div>
  );
}

function PictogramCard({ pictogram }: { pictogram: Pictogram }) {
  const Icon = pictogram.icon;

  return (
    <article className="relative grid min-h-[150px] place-items-center rounded-xl border border-stone-200 bg-white p-4 text-center">
      <EditIconButton label={`Editar ${pictogram.label}`} />
      <span className={`grid h-16 w-16 place-items-center rounded-full ${pictogram.tone}`}>
        <Icon className="h-8 w-8" />
      </span>
      <div>
        <strong className="block text-sm font-black text-stone-600">{pictogram.label}</strong>
        <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
          {pictogram.category}
        </span>
      </div>
    </article>
  );
}

function LinkDeviceButton() {
  return (
    <button
      className="grid min-h-[260px] place-items-center rounded-2xl border-2 border-dashed border-stone-300 bg-white text-stone-500 transition hover:border-[#518b51] hover:text-[#518b51]"
      type="button"
    >
      <span className="text-center">
        <Watch className="mx-auto mb-3 h-8 w-8" />
        <span className="font-semibold">Vincular nuevo dispositivo</span>
      </span>
    </button>
  );
}
