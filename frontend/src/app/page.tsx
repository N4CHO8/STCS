"use client";

import { useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bath,
  BatteryFull,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Frown,
  HelpCircle,
  Home,
  LayoutDashboard,
  LineChart as LineChartIcon,
  MapPin,
  Menu,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  School,
  Search,
  Settings2,
  ShieldCheck,
  Smile,
  Utensils,
  Volume2,
  Watch,
  Wifi,
  X,
  Zap,
  type LucideIcon
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type TabId = "dashboard" | "communicator" | "history" | "progress" | "devices";

type Pictogram = {
  id: string;
  label: string;
  category: string;
  tone: string;
  icon: LucideIcon;
};

const mockData = {
  user: {
    name: "Laura",
    childName: "Mateo",
    role: "Cuidadora principal"
  },
  device: {
    id: "STCS-ESP32-001",
    status: "ESP32 Conectado",
    battery: 82,
    wifi: "Casa_2.4G",
    firmware: "v0.1.0",
    lastSync: "Hoy, 10:42"
  },
  metrics: [
    {
      label: "Interacciones hoy",
      value: "24",
      detail: "+8 respecto a ayer",
      icon: MessageCircle,
      tone: "bg-sky-50 text-sky-700"
    },
    {
      label: "Emociones",
      value: "4",
      detail: "2 tranquilas, 1 ansiosa, 1 feliz",
      icon: Smile,
      tone: "bg-amber-50 text-amber-700"
    },
    {
      label: "Estado del dispositivo",
      value: "Activo",
      detail: "Bateria 82% y Wi-Fi estable",
      icon: Watch,
      tone: "bg-sage-50 text-sage-700"
    }
  ],
  weeklyUse: [
    { day: "Lun", interactions: 12 },
    { day: "Mar", interactions: 19 },
    { day: "Mie", interactions: 16 },
    { day: "Jue", interactions: 24 },
    { day: "Vie", interactions: 21 },
    { day: "Sab", interactions: 10 },
    { day: "Dom", interactions: 14 }
  ],
  pictograms: [
    { id: "agua", label: "Agua", category: "Necesidades", tone: "bg-sky-100 text-sky-800", icon: Droplets },
    { id: "comer", label: "Comer", category: "Necesidades", tone: "bg-amber-100 text-amber-800", icon: Utensils },
    { id: "bano", label: "Bano", category: "Necesidades", tone: "bg-cyan-100 text-cyan-800", icon: Bath },
    { id: "ayuda", label: "Ayuda", category: "Apoyo", tone: "bg-rose-100 text-rose-800", icon: HelpCircle },
    { id: "feliz", label: "Feliz", category: "Emociones", tone: "bg-yellow-100 text-yellow-800", icon: Smile },
    { id: "triste", label: "Triste", category: "Emociones", tone: "bg-blue-100 text-blue-800", icon: Frown },
    { id: "casa", label: "Casa", category: "Lugares", tone: "bg-emerald-100 text-emerald-800", icon: Home },
    { id: "colegio", label: "Colegio", category: "Lugares", tone: "bg-indigo-100 text-indigo-800", icon: School },
    { id: "pausa", label: "Pausa", category: "Acciones", tone: "bg-violet-100 text-violet-800", icon: Clock },
    { id: "salir", label: "Salir", category: "Acciones", tone: "bg-orange-100 text-orange-800", icon: MapPin }
  ] satisfies Pictogram[],
  recentActivity: [
    { action: "Selecciono: Agua", context: "Casa", user: "Cuidadora Laura", time: "10:42", icon: Droplets },
    { action: "Emocion: Ansioso", context: "Colegio", user: "Docente Ana", time: "09:15", icon: AlertTriangle },
    { action: "Sincronizacion completada", context: "Dispositivo", user: "Sistema", time: "08:30", icon: CheckCircle2 }
  ],
  categoryUse: [
    { name: "Necesidades", value: 38 },
    { name: "Acciones", value: 24 },
    { name: "Emociones", value: 18 },
    { name: "Lugares", value: 12 }
  ],
  emotionProgress: [
    { day: "1", positive: 3, difficult: 2 },
    { day: "5", positive: 4, difficult: 3 },
    { day: "10", positive: 5, difficult: 2 },
    { day: "15", positive: 6, difficult: 2 },
    { day: "20", positive: 7, difficult: 1 },
    { day: "25", positive: 6, difficult: 2 },
    { day: "30", positive: 8, difficult: 1 }
  ]
};

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "communicator", label: "Comunicador", icon: Settings2 },
  { id: "history", label: "Historial", icon: Clock },
  { id: "progress", label: "Progreso", icon: LineChartIcon },
  { id: "devices", label: "Dispositivos", icon: Watch }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const ActiveIcon = tabs.find((tab) => tab.id === activeTab)?.icon ?? LayoutDashboard;

  const selectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-white px-5 py-6 shadow-sm lg:block">
          <BrandBlock />
          <nav className="mt-8 space-y-2" aria-label="Navegacion principal">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                label={tab.label}
                onClick={() => selectTab(tab.id)}
              />
            ))}
          </nav>
          <DeviceSummary />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <BrandBlock compact />
              <button
                className="rounded-2xl border border-stone-200 p-3 text-stone-700"
                onClick={() => setIsMenuOpen((current) => !current)}
                type="button"
                aria-label="Abrir menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            {isMenuOpen ? (
              <nav className="mt-4 grid gap-2" aria-label="Navegacion movil">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    icon={tab.icon}
                    isActive={activeTab === tab.id}
                    label={tab.label}
                    onClick={() => selectTab(tab.id)}
                  />
                ))}
              </nav>
            ) : null}
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <section className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-soft md:flex-row md:items-center">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1 text-sm font-semibold text-sage-700">
                    <ActiveIcon className="h-4 w-4" />
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </div>
                  <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 md:text-4xl">
                    Hola, {mockData.user.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
                    Plataforma de apoyo para configurar el comunicador ESP32-S3
                    de {mockData.user.childName}, revisar actividad y acompanar
                    el progreso comunicativo.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusChip icon={Wifi}>{mockData.device.status}</StatusChip>
                  <StatusChip icon={BatteryFull}>{mockData.device.battery}% bateria</StatusChip>
                </div>
              </section>

              {activeTab === "dashboard" ? <DashboardView /> : null}
              {activeTab === "communicator" ? <CommunicatorView /> : null}
              {activeTab === "history" ? <HistoryView /> : null}
              {activeTab === "progress" ? <ProgressView /> : null}
              {activeTab === "devices" ? <DevicesView /> : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-600 font-display text-lg font-black text-white shadow-sm">
        S
      </div>
      <div>
        <p className="font-display text-lg font-black leading-tight text-stone-900">
          STCS
        </p>
        <p className={`${compact ? "text-xs" : "text-sm"} text-stone-500`}>
          Plataforma ESP32 + CAA
        </p>
      </div>
    </div>
  );
}

function TabButton({
  icon: Icon,
  isActive,
  label,
  onClick
}: {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
        isActive
          ? "bg-sage-600 text-white shadow-sm"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function DeviceSummary() {
  return (
    <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sage-700">
          Dispositivo
        </span>
        <Watch className="h-5 w-5 text-sage-600" />
      </div>
      <p className="font-display text-lg font-black text-stone-900">
        {mockData.device.id}
      </p>
      <p className="mt-1 text-sm text-stone-500">
        Ultima sincronizacion: {mockData.device.lastSync}
      </p>
    </div>
  );
}

function StatusChip({ children, icon: Icon }: { children: ReactNode; icon: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-sage-100 bg-sage-50 px-4 py-2 text-sm font-bold text-sage-700">
      <Icon className="h-4 w-4" />
      {children}
    </span>
  );
}

function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-3xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </article>
  );
}

function DashboardView() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        {mockData.metrics.map((metric) => (
          <Card key={metric.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-stone-500">{metric.label}</p>
                <strong className="mt-3 block font-display text-3xl font-black text-stone-900">
                  {metric.value}
                </strong>
                <p className="mt-2 text-sm text-stone-500">{metric.detail}</p>
              </div>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${metric.tone}`}>
                <metric.icon className="h-6 w-6" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-black text-stone-900">
                Uso del comunicador esta semana
              </h2>
              <p className="text-sm text-stone-500">
                Interacciones realizadas desde el dispositivo ESP32.
              </p>
            </div>
            <BarChart3 className="h-6 w-6 text-sage-600" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.weeklyUse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" stroke="#78716c" />
                <YAxis stroke="#78716c" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  name="Interacciones"
                  stroke="#518b51"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-black text-stone-900">
              Actividad reciente
            </h2>
            <Bell className="h-5 w-5 text-sage-600" />
          </div>
          <div className="space-y-3">
            {mockData.recentActivity.map((item) => (
              <ActivityItem key={`${item.action}-${item.time}`} item={item} />
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function CommunicatorView() {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-stone-700 text-white">
        <div className="mb-4 flex w-full items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold">
            <Cpu className="h-4 w-4" />
            Vista previa ESP32
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sage-500/25 px-3 py-1 text-sm font-bold text-sage-50">
            <Wifi className="h-4 w-4" />
            Online
          </span>
        </div>
        <div className="grid aspect-square w-full max-w-sm place-items-center rounded-full border-[14px] border-stone-950 bg-stone-950 p-8 shadow-2xl">
          <div className="grid h-full w-full grid-cols-2 gap-3">
            {mockData.pictograms.slice(0, 4).map((pictogram) => (
              <DeviceButton key={pictogram.id} pictogram={pictogram} />
            ))}
          </div>
        </div>
        <p className="mt-5 max-w-md text-center text-sm leading-6 text-stone-200">
          La pantalla redonda debe mostrar pocas opciones por vista para reducir
          carga visual y facilitar seleccion tactil.
        </p>
      </Card>

      <Card>
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-xl font-black text-stone-900">
              Editor de pictogramas
            </h2>
            <p className="text-sm text-stone-500">
              Gestiona botones, categorias, texto hablado y prioridad de sincronizacion.
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-600 px-4 py-3 text-sm font-black text-white shadow-sm">
            <Plus className="h-5 w-5" />
            Anadir espacio
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {mockData.pictograms.map((pictogram) => (
            <PictogramCard key={pictogram.id} pictogram={pictogram} />
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-sage-100 bg-sage-50 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="font-display text-lg font-black text-sage-900">
                Sincronizar cambios
              </p>
              <p className="text-sm text-sage-700">
                Envia la configuracion validada al dispositivo asociado.
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-600 px-4 py-3 text-sm font-black text-white">
              <RefreshCw className="h-5 w-5" />
              Sincronizar
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}

function HistoryView() {
  return (
    <Card>
      <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-display text-xl font-black text-stone-900">
            Historial de eventos
          </h2>
          <p className="text-sm text-stone-500">
            Registro de uso del comunicador, emociones y sincronizaciones.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill icon={Calendar}>Esta semana</FilterPill>
          <FilterPill icon={MapPin}>Todos los contextos</FilterPill>
          <FilterPill icon={Search}>Buscar</FilterPill>
        </div>
      </div>

      <div className="space-y-3">
        {mockData.recentActivity.concat([
          { action: "Selecciono: Ayuda", context: "Colegio", user: "Docente Ana", time: "Ayer 13:20", icon: HelpCircle },
          { action: "Selecciono: Casa", context: "Terapia", user: "Especialista Marco", time: "Ayer 11:05", icon: Home }
        ]).map((item) => (
          <ActivityItem key={`${item.action}-${item.time}`} item={item} large />
        ))}
      </div>
    </Card>
  );
}

function ProgressView() {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <Card>
        <h2 className="font-display text-xl font-black text-stone-900">
          Uso por categoria
        </h2>
        <p className="mb-5 text-sm text-stone-500">
          Frecuencia de seleccion por tipo de pictograma.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData.categoryUse} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis type="number" stroke="#78716c" />
              <YAxis dataKey="name" type="category" stroke="#78716c" width={100} />
              <Tooltip />
              <Bar dataKey="value" name="Usos" fill="#518b51" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-black text-stone-900">
          Registro emocional mensual
        </h2>
        <p className="mb-5 text-sm text-stone-500">
          Comparacion entre estados tranquilos/felices y frustrados/ansiosos.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData.emotionProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="day" stroke="#78716c" />
              <YAxis stroke="#78716c" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="positive" name="Feliz/Tranquilo" stroke="#518b51" strokeWidth={3} />
              <Line type="monotone" dataKey="difficult" name="Frustrado/Ansioso" stroke="#f97316" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}

function DevicesView() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <Card>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sage-700">
              Dispositivo actual
            </p>
            <h2 className="mt-2 font-display text-2xl font-black text-stone-900">
              {mockData.device.id}
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Comunicador fisico asociado a {mockData.user.childName}.
            </p>
          </div>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sage-50 text-sage-700">
            <Watch className="h-7 w-7" />
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DeviceDetail icon={BatteryFull} label="Bateria" value={`${mockData.device.battery}%`} />
          <DeviceDetail icon={Wifi} label="Red Wi-Fi" value={mockData.device.wifi} />
          <DeviceDetail icon={Cpu} label="Firmware" value={mockData.device.firmware} />
          <DeviceDetail icon={Clock} label="Ultima conexion" value={mockData.device.lastSync} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl bg-sage-600 px-5 py-3 text-sm font-black text-white">
            <RefreshCw className="h-5 w-5" />
            Sincronizar
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-black text-stone-700">
            <RotateCcw className="h-5 w-5" />
            Reiniciar
          </button>
        </div>
      </Card>

      <button className="grid min-h-80 place-items-center rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-6 text-center transition hover:border-sage-500 hover:bg-sage-50">
        <span>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sage-50 text-sage-700">
            <Plus className="h-8 w-8" />
          </span>
          <strong className="mt-4 block font-display text-xl font-black text-stone-900">
            Vincular nuevo dispositivo
          </strong>
          <small className="mt-2 block max-w-sm text-sm leading-6 text-stone-500">
            Agrega otra placa ESP32-S3 para asociarla a un perfil y sincronizar
            su tablero de pictogramas.
          </small>
        </span>
      </button>
    </section>
  );
}

function ActivityItem({
  item,
  large = false
}: {
  item: { action: string; context: string; user: string; time: string; icon: LucideIcon };
  large?: boolean;
}) {
  const Icon = item.icon;

  return (
    <div className={`flex gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3 ${large ? "md:items-center" : ""}`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sage-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="font-bold text-stone-900">{item.action}</p>
          <span className="text-sm font-bold text-stone-500">{item.time}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-600">
            {item.context}
          </span>
          <span className="text-xs font-semibold text-stone-500">{item.user}</span>
        </div>
      </div>
    </div>
  );
}

function DeviceButton({ pictogram }: { pictogram: Pictogram }) {
  const Icon = pictogram.icon;

  return (
    <button className={`grid place-items-center rounded-3xl p-3 text-center ${pictogram.tone}`}>
      <Icon className="h-8 w-8" />
      <span className="mt-2 text-xs font-black">{pictogram.label}</span>
    </button>
  );
}

function PictogramCard({ pictogram }: { pictogram: Pictogram }) {
  const Icon = pictogram.icon;

  return (
    <div className={`rounded-3xl border border-white/80 p-4 shadow-sm ${pictogram.tone}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70">
          <Icon className="h-6 w-6" />
        </span>
        <button className="rounded-xl bg-white/70 p-2" aria-label={`Editar ${pictogram.label}`}>
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <strong className="mt-4 block font-display text-lg font-black">
        {pictogram.label}
      </strong>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black">
          {pictogram.category}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-black">
          <Volume2 className="h-3.5 w-3.5" />
          Voz
        </span>
      </div>
    </div>
  );
}

function FilterPill({ children, icon: Icon }: { children: ReactNode; icon: LucideIcon }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600">
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function DeviceDetail({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-500">
        <Icon className="h-4 w-4 text-sage-700" />
        {label}
      </div>
      <p className="font-display text-lg font-black text-stone-900">{value}</p>
    </div>
  );
}
