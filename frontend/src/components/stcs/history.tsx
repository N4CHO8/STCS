"use client";
import { portalFetch } from "@/lib/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DeviceEvent } from "@/types/stcs";
import { HistoryView } from "./views";
export function PaginatedHistory({ profileId }: { profileId: string }) {
  const [offset, setOffset] = useState(0),
    [events, setEvents] = useState<DeviceEvent[]>([]),
    [busy, setBusy] = useState(true),
    [exporting, setExporting] = useState(false),
    [error, setError] = useState(""),
    [more, setMore] = useState(false),
    [total, setTotal] = useState(0),
    [version, setVersion] = useState(0);
  const [filters, setFilters] = useState({
    context: "",
    eventType: "",
    deviceId: "",
    from: "",
    to: "",
  });
  const [facets, setFacets] = useState<{
    contexts: string[];
    eventTypes: string[];
    devices: { id: string; label: string }[];
  }>({ contexts: [], eventTypes: [], devices: [] });
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const alive = useRef(true),
    exporter = useRef<AbortController | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      exporter.current?.abort();
    };
  }, []);
  const params = new URLSearchParams({ profileId });
  for (const [key, value] of Object.entries(filters))
    if (value) params.set(key, value);
  const query = params.toString();
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    setEvents([]);
    setMore(false);
    void portalFetch("/api/stcs/events?" + query + "&offset=" + offset, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        if (!controller.signal.aborted) {
          setEvents(result.data);
          setMore(result.hasMore);
          setTotal(result.total);
          setFacets({
            contexts: result.contexts,
            eventTypes: result.eventTypes,
            devices: result.devices,
          });
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e.message);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [query, offset, version]);
  const exportCsv = async () => {
    if (exporter.current) return;
    const controller = new AbortController();
    exporter.current = controller;
    setExporting(true);
    setError("");
    try {
      const response = await portalFetch("/api/stcs/events/export?" + query, {
        method: "POST",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error((await response.json()).message);
      const blob = await response.blob();
      if (!alive.current) return;
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "historial-stcs.csv";
      document.body.append(link);
      link.click();
      link.remove();
      // Release only after the browser starts consuming the download.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      if (alive.current && !controller.signal.aborted)
        setError(e instanceof Error ? e.message : "No fue posible exportar.");
    } finally {
      exporter.current = null;
      if (alive.current) setExporting(false);
    }
  };
  const field =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-stone-800";
  const change = (key: keyof typeof filters, value: string) => {
    setOffset(0);
    setFilters((f) => ({ ...f, [key]: value }));
  };
  return (
    <section aria-busy={busy}>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      <HistoryView
        events={events}
        isRefreshing={busy}
        onRefresh={refresh}
        onExport={() => void exportCsv()}
        isExporting={exporting}
        filters={
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold text-stone-700">
              Contexto
              <select
                className={field}
                value={filters.context}
                onChange={(e) => change("context", e.target.value)}
              >
                <option value="">Todos</option>
                {facets.contexts.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-stone-700">
              Tipo de evento
              <select
                className={field}
                value={filters.eventType}
                onChange={(e) => change("eventType", e.target.value)}
              >
                <option value="">Todos</option>
                {facets.eventTypes.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-stone-700">
              Dispositivo
              <select
                className={field}
                value={filters.deviceId}
                onChange={(e) => change("deviceId", e.target.value)}
              >
                <option value="">Todos</option>
                {facets.devices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-stone-700">
              Desde (UTC)
              <input
                type="date"
                className={field}
                value={filters.from}
                onChange={(e) => change("from", e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-stone-700">
              Hasta (UTC, inclusive)
              <input
                type="date"
                className={field}
                value={filters.to}
                onChange={(e) => change("to", e.target.value)}
              />
            </label>
            <button
              className="self-end rounded-lg border p-3"
              onClick={() => {
                setOffset(0);
                setFilters({
                  context: "",
                  eventType: "",
                  deviceId: "",
                  from: "",
                  to: "",
                });
              }}
            >
              Limpiar filtros
            </button>
          </div>
        }
      />
      <div
        className="mt-4 flex flex-wrap items-center gap-4"
        aria-live="polite"
      >
        <button
          className="rounded-lg border p-3 disabled:opacity-50"
          disabled={busy || offset === 0}
          onClick={() => setOffset((o) => Math.max(0, o - 100))}
        >
          Anterior
        </button>
        <span>
          Mostrando {events.length ? offset + 1 : 0}–{offset + events.length} de{" "}
          {total}. Los filtros y la exportación incluyen todo el historial
          coincidente. Máximo 10.000 eventos y 3 MiB por archivo.
        </span>
        <button
          className="rounded-lg border p-3 disabled:opacity-50"
          disabled={busy || !more}
          onClick={() => setOffset((o) => o + 100)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
