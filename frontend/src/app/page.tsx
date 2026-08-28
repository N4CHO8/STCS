"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
  LogOut,
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

import {
  clearAuthSession,
  getAuthSession,
  getRoleLabel,
  type AuthSession
} from "@/lib/auth";

type TabId = "dashboard" | "communicator" | "history" | "progress" | "devices";

type StudentProfile = {
  id: string;
  childUserId: string;
  displayName: string;
  age: number;
  supportLevel: string;
  mainContext: string;
};

type DeviceInfo = {
  id: string;
  code: string;
  name: string;
  status: string;
  batteryLevel: number;
  wifiSsid: string | null;
  firmwareVersion: string;
  lastSyncAt: string | null;
};

type PictogramConfig = {
  id: string;
  label: string;
  message: string;
  category: string;
  colorTone: string;
  iconName: string;
  position: number;
};

type DeviceEvent = {
  id: string;
  eventType: string;
  actionLabel: string;
  context: string;
  actorName: string;
  emotion: string | null;
  intensity: number | null;
  occurredAt: string;
  payload: Record<string, unknown>;
};

type StcsOverview = {
  user: {
    id: string;
    name: string;
    role: string;
  };
  profile: StudentProfile;
  device: DeviceInfo;
  pictograms: PictogramConfig[];
  metrics: {
    interactionsToday: number;
    emotionsToday: number;
    deviceStatus: string;
  };
  weeklyUse: Array<{ day: string; interactions: number }>;
  categoryUse: Array<{ name: string; value: number }>;
  emotionProgress: Array<{ day: string; positive: number; difficult: number }>;
  recentActivity: DeviceEvent[];
};

type DeviceEventInput = {
  eventType: string;
  actionLabel: string;
  context?: string;
  pictogramId?: string;
  category?: string;
  emotion?: string;
  intensity?: number;
};

type Pictogram = PictogramConfig & {
  tone: string;
  icon: LucideIcon;
};

const fallbackOverview: StcsOverview = {
  user: {
    id: "demo",
    name: "Cuidadora Laura",
    role: "guardian"
  },
  profile: {
    id: "profile-demo",
    childUserId: "child-demo",
    displayName: "Mateo Rojas",
    age: 8,
    supportLevel: "Apoyo comunicacional medio",
    mainContext: "Casa y colegio"
  },
  device: {
    id: "device-demo",
    code: "STCS-ESP32-001",
    name: "Comunicador Mateo",
    status: "connected",
    batteryLevel: 82,
    wifiSsid: "Casa_2.4G",
    firmwareVersion: "v0.1.0",
    lastSyncAt: new Date().toISOString()
  },
  pictograms: [
    { id: "agua", label: "Agua", message: "quiero agua", category: "Necesidades", colorTone: "sky", iconName: "Droplets", position: 1 },
    { id: "comer", label: "Comer", message: "quiero comer", category: "Necesidades", colorTone: "amber", iconName: "Utensils", position: 2 },
    { id: "bano", label: "Bano", message: "quiero ir al bano", category: "Necesidades", colorTone: "cyan", iconName: "Bath", position: 3 },
    { id: "ayuda", label: "Ayuda", message: "necesito ayuda", category: "Apoyo", colorTone: "rose", iconName: "HelpCircle", position: 4 },
    { id: "feliz", label: "Feliz", message: "estoy feliz", category: "Emociones", colorTone: "yellow", iconName: "Smile", position: 5 },
    { id: "triste", label: "Triste", message: "estoy triste", category: "Emociones", colorTone: "blue", iconName: "Frown", position: 6 },
    { id: "casa", label: "Casa", message: "quiero ir a casa", category: "Lugares", colorTone: "emerald", iconName: "Home", position: 7 },
    { id: "colegio", label: "Colegio", message: "quiero ir al colegio", category: "Lugares", colorTone: "indigo", iconName: "School", position: 8 }
  ],
  metrics: {
    interactionsToday: 0,
    emotionsToday: 0,
    deviceStatus: "connected"
  },
  weeklyUse: [
    { day: "Lun", interactions: 12 },
    { day: "Mar", interactions: 19 },
    { day: "Mie", interactions: 16 },
    { day: "Jue", interactions: 24 },
    { day: "Vie", interactions: 21 },
    { day: "Sab", interactions: 10 },
    { day: "Dom", interactions: 14 }
  ],
  categoryUse: [
    { name: "Necesidades", value: 38 },
    { name: "Acciones", value: 24 },
    { name: "Emociones", value: 18 },
    { name: "Lugares", value: 12 }
  ],
  emotionProgress: [
    { day: "01", positive: 3, difficult: 2 },
    { day: "06", positive: 4, difficult: 3 },
    { day: "11", positive: 5, difficult: 2 },
    { day: "16", positive: 6, difficult: 2 },
    { day: "21", positive: 7, difficult: 1 },
    { day: "26", positive: 6, difficult: 2 }
  ],
  recentActivity: []
};

const iconLookup: Record<string, LucideIcon> = {
  Activity,
  AlertTriangle,
  Bath,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Frown,
  HelpCircle,
  Home,
  MapPin,
  MessageCircle,
  School,
  Smile,
  Utensils,
  Watch,
  Wifi
};

const toneLookup: Record<string, string> = {
  amber: "bg-amber-100 text-amber-900",
  blue: "bg-blue-100 text-blue-900",
  cyan: "bg-cyan-100 text-cyan-900",
  emerald: "bg-emerald-100 text-emerald-900",
  indigo: "bg-indigo-100 text-indigo-900",
  orange: "bg-orange-100 text-orange-900",
  rose: "bg-rose-100 text-rose-900",
  sage: "bg-sage-100 text-sage-900",
  sky: "bg-sky-100 text-sky-900",
  violet: "bg-violet-100 text-violet-900",
  yellow: "bg-yellow-100 text-yellow-900"
};

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "communicator", label: "Comunicador", icon: Settings2 },
  { id: "history", label: "Historial", icon: Clock },
  { id: "progress", label: "Progreso", icon: LineChartIcon },
  { id: "devices", label: "Dispositivos", icon: Watch }
];

const stcsApiBaseUrl = "/api";

const mapPictogram = (pictogram: PictogramConfig): Pictogram => ({
  ...pictogram,
  icon: iconLookup[pictogram.iconName] ?? MessageCircle,
  tone: toneLookup[pictogram.colorTone] ?? "bg-stone-100 text-stone-900"
});

const getEventIcon = (event: DeviceEvent): LucideIcon => {
  if (event.eventType === "emotion_recorded") {
    return event.emotion === "feliz" || event.emotion === "tranquilo" ? Smile : AlertTriangle;
  }

  if (event.eventType === "sync_completed") {
    return CheckCircle2;
  }

  if (event.eventType === "device_restarted") {
    return RotateCcw;
  }

  const iconName = typeof event.payload.iconName === "string" ? event.payload.iconName : "";
  return iconLookup[iconName] ?? MessageCircle;
};

const formatTime = (value: string | null): string => {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin registro";
  }

  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [overview, setOverview] = useState<StcsOverview>(fallbackOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const ActiveIcon = tabs.find((tab) => tab.id === activeTab)?.icon ?? LayoutDashboard;

  const loadOverview = async (activeSession: AuthSession, showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const response = await fetch(`${stcsApiBaseUrl}/stcs/overview`, {
        headers: {
          Authorization: `Bearer ${activeSession.token}`
        },
        cache: "no-store"
      });

      if (response.status === 401) {
        clearAuthSession();
        router.replace("/login");
        return;
      }

      const payload = (await response.json()) as {
        data?: StcsOverview;
        message?: string;
      };

      if (!response.ok || !payload.data) {
        setErrorMessage(payload.message ?? "No fue posible cargar los datos del prototipo.");
        return;
      }

      setOverview(payload.data);
      setErrorMessage("");
    } catch {
      setErrorMessage("No fue posible conectar con la API del prototipo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedSession = getAuthSession();

    if (!storedSession) {
      router.replace("/login");
      return;
    }

    setSession(storedSession);
    void loadOverview(storedSession, true);
  }, [router]);

  const selectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const handleCreateEvent = async (input: DeviceEventInput) => {
    if (!session) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${stcsApiBaseUrl}/stcs/device-events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setErrorMessage(payload.message ?? "No fue posible guardar el evento.");
        return;
      }

      await loadOverview(session);
    } catch {
      setErrorMessage("No fue posible guardar el evento simulado del ESP32.");
    } finally {
      setIsSaving(false);
    }
  };

  const pictograms = overview.pictograms.map(mapPictogram);
  const roleLabel = getRoleLabel((session?.user.role ?? overview.user.role) as AuthSession["user"]["role"]);

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
          <DeviceSummary device={overview.device} profile={overview.profile} />
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
                    Hola, {session?.user.fullName ?? overview.user.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
                    Panel de apoyo para configurar el comunicador fisico de {overview.profile.displayName},
                    revisar eventos del ESP32 y seguir su progreso comunicativo.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusChip icon={ShieldCheck}>{roleLabel}</StatusChip>
                  <StatusChip icon={Wifi}>
                    {overview.device.status === "connected" ? "ESP32 conectado" : "ESP32 sin conexion"}
                  </StatusChip>
                  <StatusChip icon={BatteryFull}>{overview.device.batteryLevel}% bateria</StatusChip>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-700"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    Salir
                  </button>
                </div>
              </section>

              {errorMessage ? (
                <div className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
                  {errorMessage}
                </div>
              ) : null}

              {isLoading ? (
                <Card>
                  <div className="flex items-center gap-3 text-sm font-bold text-stone-500">
                    <RefreshCw className="h-5 w-5 animate-spin text-sage-600" />
                    Cargando perfil, dispositivo y eventos desde la base de datos...
                  </div>
                </Card>
              ) : null}

              {!isLoading && activeTab === "dashboard" ? (
                <DashboardView
                  data={overview}
                  isSaving={isSaving}
                  onCreateEvent={handleCreateEvent}
                />
              ) : null}
              {!isLoading && activeTab === "communicator" ? (
                <CommunicatorView
                  pictograms={pictograms}
                  isSaving={isSaving}
                  onCreateEvent={handleCreateEvent}
                />
              ) : null}
              {!isLoading && activeTab === "history" ? (
                <HistoryView events={overview.recentActivity} />
              ) : null}
              {!isLoading && activeTab === "progress" ? (
                <ProgressView data={overview} />
              ) : null}
              {!isLoading && activeTab === "devices" ? (
                <DevicesView
                  data={overview}
                  isSaving={isSaving}
                  onCreateEvent={handleCreateEvent}
                />
              ) : null}
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

function DeviceSummary({
  device,
  profile
}: {
  device: DeviceInfo;
  profile: StudentProfile;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sage-700">
          Dispositivo
        </span>
        <Watch className="h-5 w-5 text-sage-600" />
      </div>
      <p className="font-display text-lg font-black text-stone-900">
        {device.code}
      </p>
      <p className="mt-1 text-sm text-stone-500">{profile.displayName}</p>
      <p className="mt-1 text-sm text-stone-500">
        Ultima sincronizacion: {formatTime(device.lastSyncAt)}
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

function DashboardView({
  data,
  isSaving,
  onCreateEvent
}: {
  data: StcsOverview;
  isSaving: boolean;
  onCreateEvent: (input: DeviceEventInput) => Promise<void>;
}) {
  const metrics = [
    {
      label: "Interacciones hoy",
      value: String(data.metrics.interactionsToday),
      detail: "Eventos de pictogramas guardados en PostgreSQL",
      icon: MessageCircle,
      tone: "bg-sky-50 text-sky-700"
    },
    {
      label: "Emociones",
      value: String(data.metrics.emotionsToday),
      detail: "Registros emocionales asociados al perfil",
      icon: Smile,
      tone: "bg-amber-50 text-amber-700"
    },
    {
      label: "Estado del dispositivo",
      value: data.device.status === "connected" ? "Activo" : "Inactivo",
      detail: `Bateria ${data.device.batteryLevel}% y Wi-Fi ${data.device.wifiSsid ?? "sin definir"}`,
      icon: Watch,
      tone: "bg-sage-50 text-sage-700"
    }
  ];

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
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
                Interacciones simuladas desde el dispositivo ESP32 y guardadas en la base de datos.
              </p>
            </div>
            <BarChart3 className="h-6 w-6 text-sage-600" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyUse}>
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
            {data.recentActivity.slice(0, 4).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
              disabled={isSaving}
              onClick={() =>
                onCreateEvent({
                  eventType: "emotion_recorded",
                  actionLabel: "Emocion: Tranquilo",
                  context: "Simulacion",
                  category: "Emociones",
                  emotion: "tranquilo",
                  intensity: 4
                })
              }
              type="button"
            >
              <Smile className="h-5 w-5" />
              Simular emocion tranquila
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-700 disabled:opacity-60"
              disabled={isSaving}
              onClick={() =>
                onCreateEvent({
                  eventType: "emotion_recorded",
                  actionLabel: "Emocion: Ansioso",
                  context: "Simulacion",
                  category: "Emociones",
                  emotion: "ansioso",
                  intensity: 3
                })
              }
              type="button"
            >
              <AlertTriangle className="h-5 w-5" />
              Simular emocion ansiosa
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function CommunicatorView({
  pictograms,
  isSaving,
  onCreateEvent
}: {
  pictograms: Pictogram[];
  isSaving: boolean;
  onCreateEvent: (input: DeviceEventInput) => Promise<void>;
}) {
  const visiblePictograms = pictograms.slice(0, 4);

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
            {visiblePictograms.map((pictogram) => (
              <DeviceButton
                key={pictogram.id}
                disabled={isSaving}
                pictogram={pictogram}
                onSelect={() =>
                  onCreateEvent({
                    eventType: "pictogram_selected",
                    actionLabel: `Selecciono: ${pictogram.label}`,
                    context: "Simulacion ESP32",
                    pictogramId: pictogram.id,
                    category: pictogram.category
                  })
                }
              />
            ))}
          </div>
        </div>
        <p className="mt-5 max-w-md text-center text-sm leading-6 text-stone-200">
          Cada seleccion simula un evento emitido por el ESP32 y queda guardada
          para historial y metricas.
        </p>
      </Card>

      <Card>
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-xl font-black text-stone-900">
              Configuracion del tablero
            </h2>
            <p className="text-sm text-stone-500">
              Pictogramas asociados al perfil. El orden define como se sincroniza al ESP32.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-600 px-4 py-3 text-sm font-black text-white"
            type="button"
          >
            <Plus className="h-5 w-5" />
            Anadir espacio
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pictograms.map((pictogram) => (
            <PictogramCard
              key={pictogram.id}
              disabled={isSaving}
              pictogram={pictogram}
              onSelect={() =>
                onCreateEvent({
                  eventType: "pictogram_selected",
                  actionLabel: `Selecciono: ${pictogram.label}`,
                  context: "Simulacion web",
                  pictogramId: pictogram.id,
                  category: pictogram.category
                })
              }
            />
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-sage-100 bg-sage-50 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="font-display text-lg font-black text-sage-900">
                Sincronizar cambios
              </p>
              <p className="text-sm text-sage-700">
                Registra una sincronizacion ficticia para demostrar el flujo web-dispositivo.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
              disabled={isSaving}
              onClick={() =>
                onCreateEvent({
                  eventType: "sync_completed",
                  actionLabel: "Sincronizacion completada",
                  context: "Dispositivo",
                  category: "Sistema"
                })
              }
              type="button"
            >
              <RefreshCw className={`h-5 w-5 ${isSaving ? "animate-spin" : ""}`} />
              Sincronizar
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}

function HistoryView({ events }: { events: DeviceEvent[] }) {
  return (
    <Card>
      <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-display text-xl font-black text-stone-900">
            Historial de eventos
          </h2>
          <p className="text-sm text-stone-500">
            Evidencia de selecciones, emociones y sincronizaciones registradas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill icon={Calendar}>Esta semana</FilterPill>
          <FilterPill icon={MapPin}>Todos los contextos</FilterPill>
          <FilterPill icon={Search}>Buscar</FilterPill>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((item) => (
          <ActivityItem key={item.id} item={item} large />
        ))}
      </div>
    </Card>
  );
}

function ProgressView({ data }: { data: StcsOverview }) {
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
            <BarChart data={data.categoryUse} layout="vertical" margin={{ left: 20 }}>
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
            <LineChart data={data.emotionProgress}>
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

function DevicesView({
  data,
  isSaving,
  onCreateEvent
}: {
  data: StcsOverview;
  isSaving: boolean;
  onCreateEvent: (input: DeviceEventInput) => Promise<void>;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <Card>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sage-700">
              Dispositivo actual
            </p>
            <h2 className="mt-2 font-display text-2xl font-black text-stone-900">
              {data.device.code}
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              {data.device.name} asociado a {data.profile.displayName}.
            </p>
          </div>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sage-50 text-sage-700">
            <Watch className="h-7 w-7" />
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DeviceDetail icon={BatteryFull} label="Bateria" value={`${data.device.batteryLevel}%`} />
          <DeviceDetail icon={Wifi} label="Red Wi-Fi" value={data.device.wifiSsid ?? "No configurada"} />
          <DeviceDetail icon={Cpu} label="Firmware" value={data.device.firmwareVersion} />
          <DeviceDetail icon={Clock} label="Ultima conexion" value={formatTime(data.device.lastSyncAt)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-sage-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
            disabled={isSaving}
            onClick={() =>
              onCreateEvent({
                eventType: "sync_completed",
                actionLabel: "Sincronizacion completada",
                context: "Dispositivo",
                category: "Sistema"
              })
            }
            type="button"
          >
            <RefreshCw className={`h-5 w-5 ${isSaving ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-black text-stone-700 disabled:opacity-60"
            disabled={isSaving}
            onClick={() =>
              onCreateEvent({
                eventType: "device_restarted",
                actionLabel: "Reinicio del dispositivo",
                context: "Dispositivo",
                category: "Sistema"
              })
            }
            type="button"
          >
            <RotateCcw className="h-5 w-5" />
            Reiniciar
          </button>
        </div>
      </Card>

      <button
        className="grid min-h-80 place-items-center rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-6 text-center transition hover:border-sage-500 hover:bg-sage-50"
        type="button"
      >
        <span>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sage-50 text-sage-700">
            <Plus className="h-8 w-8" />
          </span>
          <strong className="mt-4 block font-display text-xl font-black text-stone-900">
            Vincular nuevo dispositivo
          </strong>
          <small className="mt-2 block max-w-sm text-sm leading-6 text-stone-500">
            Espacio preparado para asociar otra placa ESP32-S3 a un perfil.
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
  item: DeviceEvent;
  large?: boolean;
}) {
  const Icon = getEventIcon(item);

  return (
    <div className={`flex gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3 ${large ? "md:items-center" : ""}`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sage-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="font-bold text-stone-900">{item.actionLabel}</p>
          <span className="text-sm font-bold text-stone-500">{formatTime(item.occurredAt)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-600">
            {item.context}
          </span>
          <span className="text-xs font-semibold text-stone-500">{item.actorName}</span>
        </div>
      </div>
    </div>
  );
}

function DeviceButton({
  disabled,
  pictogram,
  onSelect
}: {
  disabled: boolean;
  pictogram: Pictogram;
  onSelect: () => void;
}) {
  const Icon = pictogram.icon;

  return (
    <button
      className={`grid place-items-center rounded-3xl p-3 text-center transition hover:scale-[1.02] disabled:opacity-60 ${pictogram.tone}`}
      disabled={disabled}
      onClick={onSelect}
      type="button"
    >
      <Icon className="h-8 w-8" />
      <span className="mt-2 text-xs font-black">{pictogram.label}</span>
    </button>
  );
}

function PictogramCard({
  disabled,
  pictogram,
  onSelect
}: {
  disabled: boolean;
  pictogram: Pictogram;
  onSelect: () => void;
}) {
  const Icon = pictogram.icon;

  return (
    <div className={`rounded-3xl border border-white/80 p-4 shadow-sm ${pictogram.tone}`}>
      <div className="flex items-start justify-between gap-3">
        <button
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 transition hover:scale-105 disabled:opacity-60"
          disabled={disabled}
          onClick={onSelect}
          type="button"
          aria-label={`Simular seleccion de ${pictogram.label}`}
        >
          <Icon className="h-6 w-6" />
        </button>
        <button className="rounded-xl bg-white/70 p-2" type="button" aria-label={`Editar ${pictogram.label}`}>
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <strong className="mt-4 block font-display text-lg font-black">
        {pictogram.label}
      </strong>
      <p className="mt-1 text-sm font-semibold opacity-80">{pictogram.message}</p>
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
    <button className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600" type="button">
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
