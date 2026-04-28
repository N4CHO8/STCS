interface PictogramTileProps {
  emoji: string;
  label: string;
  category: string;
}

export function PictogramTile({ emoji, label, category }: PictogramTileProps) {
  return (
    <button className="pictogram-tile" type="button" aria-label={label}>
      <span className="pictogram-emoji" aria-hidden="true">
        {emoji}
      </span>
      <strong>{label}</strong>
      <span>{category}</span>
    </button>
  );
}
