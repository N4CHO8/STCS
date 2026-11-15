"use client";
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
  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    setError("");
    setStatus("pending");
    setAudioKey("");
    async function refresh() {
      try {
        const r = await fetch(`/api/stcs/pictograms/${id}/audio?status=1`, {
          signal: abort.signal,
          cache: "no-store",
        });
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
        if (["pending", "processing"].includes(data.data.audioStatus))
          timer = setTimeout(refresh, 3000);
      } catch (e) {
        if (!abort.signal.aborted)
          setError(
            e instanceof Error ? e.message : "No se pudo consultar la voz.",
          );
      }
    }
    void refresh();
    return () => {
      abort.abort();
      if (timer) clearTimeout(timer);
    };
  }, [id, message, version]);
  async function prepare() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/stcs/pictograms/${id}/audio`, {
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
        {status === "ready"
          ? "Voz lista"
          : status === "pending" || status === "processing"
            ? "Preparando voz…"
            : status === "error"
              ? "No se pudo preparar la voz"
              : "Voz sin preparar"}
      </p>
      {status === "ready" && (
        <>
          <audio
            key={message}
            aria-label={`Escuchar frase: ${message}`}
            className="w-full"
            controls
            preload="none"
            src={`/api/stcs/pictograms/${id}/audio?v=${audioKey}`}
          />
          <span className="text-stone-500">
            Vista previa web del audio preparado para el dispositivo.
          </span>
        </>
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
