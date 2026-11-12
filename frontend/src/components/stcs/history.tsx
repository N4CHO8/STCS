"use client";
import { useCallback, useEffect, useState } from "react";
import type { DeviceEvent } from "@/types/stcs";
import { HistoryView } from "./views";
export function PaginatedHistory({ profileId }: { profileId: string }) {
  const [offset, setOffset] = useState(0),
    [events, setEvents] = useState<DeviceEvent[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [more, setMore] = useState(false),
    [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    setEvents([]);
    void fetch(`/api/stcs/events?profileId=${profileId}&offset=${offset}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        if (!controller.signal.aborted) {
          setEvents(result.data);
          setMore(result.hasMore);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [profileId, offset, version]);
  return (
    <section>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      <HistoryView events={events} isRefreshing={busy} onRefresh={refresh} />
      <div className="mt-4 flex items-center gap-4">
        <button
          className="rounded-lg border p-3 disabled:opacity-50"
          disabled={busy || offset === 0}
          onClick={() => setOffset((o) => Math.max(0, o - 100))}
        >
          Anterior
        </button>
        <span>
          Mostrando {events.length ? offset + 1 : 0}–{offset + events.length}.
          Filtros aplicados a esta página.
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
