import { ReactNode } from "react";

interface EmotionButtonProps {
  icon: ReactNode;
  label: string;
  tone: "calm" | "happy" | "neutral" | "alert";
}

export function EmotionButton({ icon, label, tone }: EmotionButtonProps) {
  return (
    <button className={`emotion-button emotion-button-${tone}`} type="button">
      <span aria-hidden="true">{icon}</span>
      <strong>{label}</strong>
    </button>
  );
}
