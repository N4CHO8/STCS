import {
  AlertTriangle,
  Bath,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Frown,
  HelpCircle,
  Home,
  LayoutDashboard,
  LineChart,
  MapPin,
  MessageCircle,
  School,
  Settings2,
  Smile,
  Utensils,
  Watch,
  Wifi,
  type LucideIcon
} from "lucide-react";

import type { PictogramConfig, StcsOverview, TabId } from "@/types/stcs";

export type Pictogram = PictogramConfig & {
  tone: string;
  icon: LucideIcon;
};

export const FALLBACK_OVERVIEW: StcsOverview = {
  user: {
    id: "demo",
    name: "Laura",
    role: "guardian"
  },
  profile: {
    id: "profile-demo",
    childUserId: "child-demo",
    displayName: "Mateo",
    age: 8,
    supportLevel: "Apoyo comunicacional medio",
    mainContext: "Casa y colegio"
  },
  device: {
    id: "device-demo",
    code: "STCS-ESP32-001",
    name: "Comunicador Mateo",
    status: "pending",
    batteryLevel: 0,
    wifiSsid: null,
    firmwareVersion: "v0.1.0",
    lastSyncAt: null
  },
  pictograms: [
    { id: "quiero", label: "Quiero", message: "quiero", category: "Acciones", colorTone: "sky", iconName: "MessageCircle", position: 1 },
    { id: "agua", label: "Agua", message: "quiero agua", category: "Necesidades", colorTone: "blue", iconName: "Droplets", position: 2 },
    { id: "bano", label: "Bano", message: "quiero ir al bano", category: "Necesidades", colorTone: "sage", iconName: "Bath", position: 3 },
    { id: "feliz", label: "Feliz", message: "estoy feliz", category: "Emociones", colorTone: "yellow", iconName: "Smile", position: 4 }
  ],
  metrics: {
    interactionsToday: 0,
    emotionsToday: 0,
    deviceStatus: "pending"
  },
  weeklyUse: [],
  categoryUse: [],
  emotionProgress: [],
  recentActivity: []
};

export const NAV_TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { id: "communicator", label: "Comunicador", icon: Settings2 },
  { id: "history", label: "Historial", icon: Clock },
  { id: "progress", label: "Progreso", icon: LineChart },
  { id: "devices", label: "Dispositivos", icon: Watch }
];

const ICONS: Record<string, LucideIcon> = {
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

const TONES: Record<string, string> = {
  amber: "bg-amber-100 text-stone-600",
  blue: "bg-blue-100 text-stone-600",
  cyan: "bg-cyan-100 text-stone-600",
  emerald: "bg-emerald-100 text-stone-600",
  indigo: "bg-indigo-100 text-stone-600",
  orange: "bg-orange-100 text-stone-600",
  rose: "bg-rose-100 text-stone-600",
  sage: "bg-emerald-50 text-stone-600",
  sky: "bg-sky-100 text-stone-600",
  violet: "bg-violet-100 text-stone-600",
  yellow: "bg-yellow-100 text-stone-600"
};

export const mapPictogram = (pictogram: PictogramConfig): Pictogram => ({
  ...pictogram,
  icon: ICONS[pictogram.iconName] ?? MessageCircle,
  tone: TONES[pictogram.colorTone] ?? "bg-stone-100 text-stone-600"
});

export const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "Sin datos";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin datos";
  }

  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const hasWeeklyData = (items: StcsOverview["weeklyUse"]) =>
  items.some((item) => item.interactions > 0);

export const hasEmotionData = (items: StcsOverview["emotionProgress"]) =>
  items.some((item) => item.positive > 0 || item.difficult > 0);
