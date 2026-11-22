"use client";
import { useState } from "react";
import type { ChildDetail } from "@/types/portal";
import type { SaveAction } from "./portal-forms";
import { Card, SectionTitle, SmallButton } from "./shared";

export function UsageStart({
  profileId,
  date,
  editable,
  save,
}: {
  profileId: string;
  date: string | null;
  editable: boolean;
  save: SaveAction;
}) {
  const [value, setValue] = useState(date ?? "");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <Card>
      <SectionTitle>Inicio de uso del comunicador</SectionTitle>
      {!editable ? (
        <p className="mt-2">{date ?? "Sin fecha registrada"}</p>
      ) : (
        <form
          className="mt-3 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setMessage("");
            try {
              await save({
                action: "usageStart",
                profileId,
                date: value || null,
              });
              setMessage("Fecha guardada.");
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "No se pudo guardar.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="grid gap-2 text-sm font-semibold">
            Fecha de inicio
            <input
              className="min-h-11 rounded-lg border border-stone-300 px-3"
              type="date"
              value={value}
              disabled={busy}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <SmallButton type="submit" disabled={busy}>
            Guardar fecha de inicio
          </SmallButton>
        </form>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      )}
    </Card>
  );
}

export function CommunicationObservations({
  profileId,
  items,
  writable,
  save,
}: {
  profileId: string;
  items: NonNullable<ChildDetail["observations"]>;
  writable: boolean;
  save: SaveAction;
}) {
  const [text, setText] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <Card>
      <SectionTitle>Observaciones de comunicación</SectionTitle>
      <p className="mt-2 text-sm text-stone-600">
        {writable
          ? "Describe una situación de comunicación o un apoyo que haya servido. El especialista recibe tu observación; no incluyas diagnósticos."
          : "Observaciones enviadas por los docentes asignados para orientar los apoyos de comunicación."}
      </p>
      {writable && (
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || !text.trim()) return;
            setBusy(true);
            setMessage("");
            try {
              await save({ action: "observation", profileId, requestId, text });
              setText("");
              setRequestId(crypto.randomUUID());
              setMessage("Observación enviada al especialista.");
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "No se pudo enviar.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="grid gap-2 text-sm font-semibold">
            Observación para el especialista
            <textarea
              className="min-h-28 rounded-lg border border-stone-300 p-3"
              maxLength={2000}
              required
              disabled={busy}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setRequestId(crypto.randomUUID());
              }}
            />
          </label>
          <SmallButton type="submit" disabled={busy || !text.trim()}>
            Enviar observación
          </SmallButton>
        </form>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      )}
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-stone-200 p-3"
          >
            <p className="text-sm text-stone-600">
              {item.author} · {new Date(item.createdAt).toLocaleString("es-CL")}
            </p>
            <p className="mt-2 whitespace-pre-wrap">{item.text}</p>
          </article>
        ))}
        {!items.length && (
          <p className="text-sm text-stone-600">
            Sin observaciones registradas.
          </p>
        )}
      </div>
    </Card>
  );
}
