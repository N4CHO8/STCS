"use client";

import { useEffect, useRef, useState } from "react";
import { portalFetch } from "@/lib/auth";
import { visibleBoard, type BoardSelection } from "@/lib/board-selection";
import { DEVICE_CATEGORIES, type DeviceCategory } from "@/lib/pictogramCatalog";
import { Card, SmallButton, SectionTitle } from "./shared";

type Item = { id: string; category: string; label: string };

export function BoardSelectionEditor({
  profileId,
  items,
  selection,
  editable,
  onSaved,
}: {
  profileId: string;
  items: Item[];
  selection: BoardSelection | null;
  editable: boolean;
  onSaved: (selection: BoardSelection | null) => void;
}) {
  const [ids, setIds] = useState(() =>
    visibleBoard(items, selection).map((p) => p.id),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const saving = useRef<AbortController | null>(null);
  useEffect(() => {
    const cancel = () => saving.current?.abort();
    window.addEventListener("pagehide", cancel);
    return () => {
      cancel();
      window.removeEventListener("pagehide", cancel);
    };
  }, []);
  const chosen = items.filter((p) => ids.includes(p.id));
  async function save(all = false) {
    const controller = new AbortController();
    saving.current = controller;
    setBusy(true);
    setError("");
    setNotice("");
    const nextSelection: BoardSelection | null = all
      ? null
      : {
          categories: DEVICE_CATEGORIES.filter((c) =>
            chosen.some((p) => p.category === c),
          ),
          pictogramIds: chosen.map((p) => p.id),
        };
    try {
      const response = await portalFetch("/api/stcs/portal", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "boardSelection",
          profileId,
          selection: nextSelection,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message ?? "No se pudo guardar la selección.");
      if (controller.signal.aborted) return;
      if (all) setIds(items.map((p) => p.id));
      setNotice(
        "Selección guardada. El ESP la aplicará al sincronizar con la frase vacía.",
      );
      onSaved(nextSelection);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }
  if (!editable)
    return (
      <Card>
        <SectionTitle>Tablero visible en el ESP</SectionTitle>
        <p className="mt-2 text-sm">
          {visibleBoard(items, selection).length} pictogramas visibles. El
          especialista decide qué categorías y pictogramas mostrar.
        </p>
      </Card>
    );
  return (
    <Card>
      <SectionTitle>Adaptar el ESP a este niño</SectionTitle>
      <p className="mt-2 text-sm text-stone-600">
        Elige las opciones que necesita ahora. Los pictogramas que ocultes
        seguirán guardados en el catálogo. Con una sola categoría, el ESP abrirá
        sus pictogramas directamente.
      </p>
      <fieldset disabled={busy} className="mt-4 grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Categorías y pictogramas visibles</legend>
        {DEVICE_CATEGORIES.map((category: DeviceCategory) => {
          const group = items.filter((p) => p.category === category);
          const selected = group.filter((p) => ids.includes(p.id));
          return (
            <div
              key={category}
              className="rounded-xl border border-stone-200 p-3"
            >
              <label className="flex min-h-11 items-center gap-3 font-bold">
                <input
                  type="checkbox"
                  disabled={!group.length}
                  checked={selected.length > 0}
                  onChange={(e) =>
                    setIds((previous) =>
                      e.target.checked
                        ? [...new Set([...previous, ...group.map((p) => p.id)])]
                        : previous.filter(
                            (id) => !group.some((p) => p.id === id),
                          ),
                    )
                  }
                />
                {category} ({selected.length}/{group.length})
              </label>
              <div className="max-h-52 overflow-y-auto">
                {group.map((p) => (
                  <label
                    key={p.id}
                    className="flex min-h-11 items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={ids.includes(p.id)}
                      onChange={(e) =>
                        setIds((previous) =>
                          e.target.checked
                            ? [...new Set([...previous, p.id])]
                            : previous.filter((id) => id !== p.id),
                        )
                      }
                    />
                    {p.label}
                  </label>
                ))}
                {!group.length && (
                  <p className="text-sm text-stone-600">
                    Sin pictogramas guardados.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </fieldset>
      <p className="mt-3 text-sm">
        {chosen.length} pictogramas seleccionados. Elige al menos uno para
        guardar.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <SmallButton
          disabled={busy || !chosen.length}
          onClick={() => void save()}
        >
          Guardar selección del ESP
        </SmallButton>
        <SmallButton
          disabled={busy || !items.length}
          onClick={() => void save(true)}
        >
          Mostrar todo el catálogo
        </SmallButton>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 text-green-800">
          {notice}
        </p>
      )}
    </Card>
  );
}
