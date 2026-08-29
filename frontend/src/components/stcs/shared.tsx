import type { ReactNode } from "react";
import {
  LogOut,
  Pencil,
  Plus,
  type LucideIcon
} from "lucide-react";

import { formatDateTime } from "@/lib/stcsUi";
import type { DeviceEvent } from "@/types/stcs";

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#518b51] font-display text-base font-black text-white">
        S
      </div>
      <div>
        <p className="font-display text-xl font-black leading-none text-stone-700">STCS</p>
        <p className="mt-1 text-xs font-medium text-stone-400">Portal de Apoyo</p>
      </div>
    </div>
  );
}

export function TabButton({
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
      className={`flex h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition ${
        isActive
          ? "border-2 border-stone-800 bg-[#f7faf6] text-[#518b51]"
          : "border-2 border-transparent text-stone-500 hover:bg-stone-50"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function UserProfile({
  displayName,
  onLogout,
  roleLabel
}: {
  displayName: string;
  onLogout: () => void;
  roleLabel: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-[#518b51]">
        {displayName.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-600">
          {displayName} ({roleLabel})
        </p>
      </div>
      <button
        aria-label="Cerrar sesion"
        className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
        onClick={onLogout}
        type="button"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-2xl border border-stone-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </article>
  );
}

export function PageHeader({
  action,
  subtitle,
  title
}: {
  action?: ReactNode;
  subtitle?: string;
  title: ReactNode;
}) {
  return (
    <header className="mb-1 flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <h1 className="font-display text-[2rem] font-black leading-tight text-stone-600">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-base font-medium text-stone-400">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-lg font-black text-stone-600">
      {children}
    </h2>
  );
}

export function SmallButton({
  children,
  muted = false
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
        muted
          ? "bg-stone-100 text-stone-500 hover:bg-stone-200"
          : "bg-[#518b51] text-white hover:bg-[#457745]"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-500 shadow-sm">
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="grid min-h-[230px] place-items-center text-center">
      <div>
        <Icon className="mx-auto h-10 w-10 text-stone-200" />
        <p className="mt-3 text-sm font-semibold text-stone-400">{text}</p>
      </div>
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card className="min-h-[162px]">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-sm font-semibold text-stone-500">{label}</p>
      <strong className="mt-5 block font-display text-3xl font-black text-stone-600">
        {value}
      </strong>
    </Card>
  );
}

export function ActivityItem({
  event,
  large = false
}: {
  event: DeviceEvent;
  large?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${large ? "rounded-xl border border-stone-200 p-4" : ""}`}>
      <span className="mt-1 h-2 w-2 rounded-full bg-[#518b51]" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-stone-600">{event.actionLabel}</p>
        <p className="text-xs font-medium text-stone-400">
          {formatDateTime(event.occurredAt)} | {event.actorName}
        </p>
      </div>
    </div>
  );
}

export function FilterButton({
  children,
  icon: Icon
}: {
  children: ReactNode;
  icon: LucideIcon;
}) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-500"
      type="button"
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

export function DeviceDetail({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-[#fbfbf9] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="font-display text-lg font-black text-stone-600">{value}</p>
    </div>
  );
}

export function AddSpaceButton() {
  return (
    <button
      className="grid min-h-[140px] place-items-center rounded-xl border-2 border-dashed border-stone-300 bg-white text-stone-500 transition hover:border-[#518b51] hover:text-[#518b51]"
      type="button"
    >
      <span className="text-center">
        <Plus className="mx-auto mb-3 h-6 w-6" />
        <span className="font-semibold">Anadir espacio</span>
      </span>
    </button>
  );
}

export function EditIconButton({ label }: { label: string }) {
  return (
    <button
      aria-label={label}
      className="absolute right-3 top-3 rounded-lg p-1 text-stone-300 hover:bg-stone-100 hover:text-stone-500"
      type="button"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}
