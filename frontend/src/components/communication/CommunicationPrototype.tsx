"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eraser, Plus, RotateCcw, Save, Settings, Volume2 } from "lucide-react";

import { PictogramTile } from "@/components/ui/PictogramTile";
import {
  defaultPictograms,
  pictogramCategories,
  type PictogramCategoryId,
  type PictogramItem,
  type PictogramTone
} from "@/lib/pictograms";

const STORAGE_KEY = "stcs-aac-board-v1";

const emptyForm = {
  id: "",
  categoryId: "core" as PictogramCategoryId,
  label: "",
  message: "",
  emoji: "⭐",
  tone: "custom" as PictogramTone
};

const toneOptions: Array<{ value: PictogramTone; label: string }> = [
  { value: "core", label: "Clave" },
  { value: "need", label: "Necesidad" },
  { value: "food", label: "Comida" },
  { value: "happy", label: "Feliz" },
  { value: "sad", label: "Triste" },
  { value: "angry", label: "Alerta" },
  { value: "calm", label: "Calma" },
  { value: "action", label: "Accion" },
  { value: "place", label: "Lugar" },
  { value: "person", label: "Persona" },
  { value: "routine", label: "Rutina" },
  { value: "question", label: "Pregunta" },
  { value: "custom", label: "Personalizado" }
];

const loadBoard = (): PictogramItem[] => {
  if (typeof window === "undefined") {
    return defaultPictograms;
  }

  const storedBoard = window.localStorage.getItem(STORAGE_KEY);

  if (!storedBoard) {
    return defaultPictograms;
  }

  try {
    return JSON.parse(storedBoard) as PictogramItem[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultPictograms;
  }
};

const saveBoard = (items: PictogramItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const getSpeechSupport = (): SpeechSynthesis | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
};

export function CommunicationPrototype() {
  const [boardItems, setBoardItems] = useState<PictogramItem[]>(defaultPictograms);
  const [activeCategory, setActiveCategory] =
    useState<PictogramCategoryId>("core");
  const [selectedPictograms, setSelectedPictograms] = useState<PictogramItem[]>(
    []
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formState, setFormState] = useState(emptyForm);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setBoardItems(loadBoard());
  }, []);

  const activeCategoryInfo = pictogramCategories.find(
    (category) => category.id === activeCategory
  );

  const visiblePictograms = useMemo(
    () => boardItems.filter((pictogram) => pictogram.categoryId === activeCategory),
    [activeCategory, boardItems]
  );

  const currentMessage = selectedPictograms
    .map((pictogram) => pictogram.message)
    .join(" ");

  const handleSelectPictogram = (pictogram: PictogramItem) => {
    setSelectedPictograms((current) => [...current, pictogram]);
    setFeedback("");
  };

  const handleSpeak = () => {
    if (!currentMessage) {
      setFeedback("Elige un boton para formar un mensaje.");
      return;
    }

    const speech = getSpeechSupport();

    if (!speech) {
      setFeedback(currentMessage);
      return;
    }

    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(currentMessage);
    utterance.lang = "es-CL";
    utterance.rate = 0.86;
    speech.speak(utterance);
    setFeedback(currentMessage);
  };

  const handleClear = () => {
    setSelectedPictograms([]);
    setFeedback("");
  };

  const handleRemoveLast = () => {
    setSelectedPictograms((current) => current.slice(0, -1));
    setFeedback("");
  };

  const handleEdit = (item: PictogramItem) => {
    setFormState(item);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setFormState({
      ...emptyForm,
      id: `custom-${Date.now()}`,
      categoryId: activeCategory
    });
    setIsEditorOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedItem: PictogramItem = {
      id: formState.id || `custom-${Date.now()}`,
      categoryId: formState.categoryId,
      label: formState.label.trim(),
      message: formState.message.trim(),
      emoji: formState.emoji.trim() || "⭐",
      tone: formState.tone
    };

    if (!cleanedItem.label || !cleanedItem.message) {
      setFeedback("Completa nombre y mensaje del boton.");
      return;
    }

    const nextItems = boardItems.some((item) => item.id === cleanedItem.id)
      ? boardItems.map((item) => (item.id === cleanedItem.id ? cleanedItem : item))
      : [...boardItems, cleanedItem];

    setBoardItems(nextItems);
    saveBoard(nextItems);
    setActiveCategory(cleanedItem.categoryId);
    setIsEditorOpen(false);
    setFeedback("Boton guardado.");
  };

  const handleResetBoard = () => {
    setBoardItems(defaultPictograms);
    saveBoard(defaultPictograms);
    setSelectedPictograms([]);
    setFeedback("Tablero restaurado.");
  };

  return (
    <div className="aac-prototype" data-editor-open={isEditorOpen}>
      <section className="aac-message-bar" aria-label="Mensaje actual">
        <div className="aac-message-output">
          {selectedPictograms.length ? (
            selectedPictograms.map((pictogram, index) => (
              <span className={`message-chip tone-${pictogram.tone}`} key={`${pictogram.id}-${index}`}>
                <span aria-hidden="true">{pictogram.emoji}</span>
                {pictogram.message}
              </span>
            ))
          ) : (
            <span className="message-placeholder">Toca botones para hablar</span>
          )}
        </div>

        <div className="aac-message-actions">
          <button className="primary-button" onClick={handleSpeak} type="button">
            <Volume2 aria-hidden="true" />
            Hablar
          </button>
          <button className="quiet-button" onClick={handleRemoveLast} type="button">
            <Eraser aria-hidden="true" />
            Borrar
          </button>
          <button className="quiet-button" onClick={handleClear} type="button">
            Limpiar
          </button>
        </div>
      </section>

      {feedback ? <p className="aac-feedback">{feedback}</p> : null}

      <section className="aac-category-strip" aria-label="Categorias de comunicacion">
        {pictogramCategories.map((category) => (
          <button
            aria-current={category.id === activeCategory ? "true" : undefined}
            className={`aac-category ${category.id === activeCategory ? "aac-category-active" : ""}`}
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            type="button"
          >
            <strong>{category.label}</strong>
            <span>{category.helper}</span>
          </button>
        ))}
      </section>

      <div className="aac-board-shell">
        <section className="aac-board" aria-label={`Botones de ${activeCategoryInfo?.label}`}>
          {visiblePictograms.map((pictogram) => (
            <PictogramTile
              category={activeCategoryInfo?.label ?? ""}
              emoji={pictogram.emoji}
              isEditorOpen={isEditorOpen}
              isSelected={selectedPictograms.some((selected) => selected.id === pictogram.id)}
              key={pictogram.id}
              label={pictogram.label}
              onEdit={() => handleEdit(pictogram)}
              onSelect={() => handleSelectPictogram(pictogram)}
              tone={pictogram.tone}
            />
          ))}
        </section>

        <aside className="aac-caregiver-panel" aria-label="Ajustar tablero">
          <button
            className="caregiver-toggle"
            onClick={() => setIsEditorOpen((current) => !current)}
            type="button"
          >
            <Settings aria-hidden="true" />
            Ajustar tablero
          </button>

          {isEditorOpen ? (
            <div className="aac-editor">
              <div className="editor-actions">
                <button className="quiet-button" onClick={handleNew} type="button">
                  <Plus aria-hidden="true" />
                  Nuevo boton
                </button>
                <button className="quiet-button" onClick={handleResetBoard} type="button">
                  <RotateCcw aria-hidden="true" />
                  Restaurar
                </button>
              </div>

              <form className="button-editor-form" onSubmit={handleSubmit}>
                <label>
                  Nombre
                  <input
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        label: event.target.value
                      }))
                    }
                    value={formState.label}
                  />
                </label>
                <label>
                  Mensaje hablado
                  <input
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        message: event.target.value
                      }))
                    }
                    value={formState.message}
                  />
                </label>
                <label>
                  Icono simple
                  <input
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        emoji: event.target.value
                      }))
                    }
                    value={formState.emoji}
                  />
                </label>
                <label>
                  Categoria
                  <select
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        categoryId: event.target.value as PictogramCategoryId
                      }))
                    }
                    value={formState.categoryId}
                  >
                    {pictogramCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Color CAA
                  <select
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        tone: event.target.value as PictogramTone
                      }))
                    }
                    value={formState.tone}
                  >
                    {toneOptions.map((tone) => (
                      <option key={tone.value} value={tone.value}>
                        {tone.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="primary-button" type="submit">
                  <Save aria-hidden="true" />
                  Guardar boton
                </button>
              </form>
            </div>
          ) : (
            <p className="caregiver-hint">
              Panel para cuidadores: permite agregar o modificar botones sin
              recargar la app.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
