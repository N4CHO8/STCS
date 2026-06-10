import type { PictogramTone } from "@/lib/pictograms";

interface PictogramTileProps {
  label: string;
  category: string;
  emoji: string;
  tone: PictogramTone;
  isEditorOpen?: boolean;
  isSelected?: boolean;
  onEdit?: () => void;
  onSelect?: () => void;
}

export function PictogramTile({
  label,
  category,
  emoji,
  tone,
  isEditorOpen = false,
  isSelected = false,
  onEdit,
  onSelect
}: PictogramTileProps) {
  return (
    <div className={`aac-button-wrap ${isSelected ? "aac-button-wrap-selected" : ""}`}>
      <button
        aria-label={`Comunicar ${label}`}
        aria-pressed={isSelected}
        className={`aac-button tone-${tone}`}
        onClick={onSelect}
        type="button"
      >
        <span className="aac-button-emoji" aria-hidden="true">
          {emoji}
        </span>
        <strong>{label}</strong>
        <small>{category}</small>
      </button>

      {isEditorOpen ? (
        <button className="aac-edit-button" onClick={onEdit} type="button">
          Editar
        </button>
      ) : null}
    </div>
  );
}
