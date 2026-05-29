import { ReactNode } from "react";

interface PictogramTileProps {
  icon: ReactNode;
  label: string;
  category: string;
}

export function PictogramTile({ icon, label, category }: PictogramTileProps) {
  return (
    <button className="pictogram-tile" type="button" aria-label={label}>
      <span className="pictogram-icon" aria-hidden="true">
        {icon}
      </span>
      <strong>{label}</strong>
      <span>{category}</span>
    </button>
  );
}
