"use client";
import { portalFetch } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { AudioStatus } from "@/lib/media-contract";

export function PictogramVoice({
  id,
  message,
}: {
  id: string;
  message: string;
}) {
  const [status, setStatus] = useState<AudioStatus>("missing"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [audioKey, setAudioKey] = useState(""),
    [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    setError("");
    setStatus("pending");
    setAudioKey("");
    setLoaded(false);
    let querying = false;
    const cancel = () => {
      abort.abort();
      if (timer) clearTimeout(timer);
    };
    const resume = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        void refresh();
      }
    };
    // A hard reload does not guarantee React cleanup before WebKit tears down the document.
    window.addEventListener("pagehide", cancel);
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) setVersion((v) => v + 1);
    };
    window.addEventListener("pageshow", restore);
    document.addEventListener("visibilitychange", resume);
    async function refresh() {
      if (
        querying ||
        abort.signal.aborted ||
        document.visibilityState === "hidden"
      )
        return;
      querying = true;
      try {
        const r = await portalFetch(
          `/api/stcs/pictograms/${id}/audio?status=1`,
          {
            signal: abort.signal,
            cache: "no-store",
          },
        );
        const data = await r.json();
        if (!r.ok) throw new Error(data.message);
        if (abort.signal.aborted) return;
        if (data.data.message !== message) {
          setStatus("missing");
          setError("El pictograma cambió. Actualiza el tablero.");
          return;
        }
        setAudioKey(data.data.audioKey ?? "");
        setStatus(data.data.audioStatus);
        setError(data.data.audioError ?? "");
        if (
          !abort.signal.aborted &&
          document.visibilityState === "visible" &&
          ["pending", "processing"].includes(data.data.audioStatus)
        )
          timer = setTimeout(refresh, 3000);
      } catch (e) {
        if (!abort.signal.aborted)
          setError(
            e instanceof Error ? e.message : "No se pudo consultar la voz.",
          );
      } finally {
        querying = false;
        if (!abort.signal.aborted) setLoaded(true);
      }
    }
    void refresh();
    return () => {
      window.removeEventListener("pagehide", cancel);
      window.removeEventListener("pageshow", restore);
      document.removeEventListener("visibilitychange", resume);
      cancel();
    };
  }, [id, message, version]);
  async function prepare() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await portalFetch(`/api/stcs/pictograms/${id}/audio`, {
        method: "POST",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo preparar la voz.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-3 grid w-full gap-2 text-left text-xs">
      <p role="status">
        {!loaded
          ? "Consultando voz…"
          : status === "ready"
            ? "Voz lista"
            : status === "pending" || status === "processing"
              ? "Preparando voz…"
              : status === "error"
                ? "No se pudo preparar la voz"
                : "Voz sin preparar"}
      </p>
      {status === "ready" && (
        <audio
          key={message}
          aria-label={`Escuchar frase: ${message}`}
          className="w-full"
          controls
          preload="none"
          src={`/api/stcs/pictograms/${id}/audio?v=${audioKey}`}
        />
      )}
      {error && (
        <p role="alert" className="text-rose-700">
          {error}
        </p>
      )}
      {(status === "missing" || status === "error" || error) && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void prepare()}
          className="rounded-lg border p-2 text-emerald-900 disabled:opacity-50"
        >
          {busy ? "Solicitando…" : "Preparar voz / reintentar"}
        </button>
      )}
    </div>
  );
}
