interface EmotionButtonProps {
  emoji: string;
  label: string;
  tone: "calm" | "happy" | "neutral" | "alert";
}

export function EmotionButton({ emoji, label, tone }: EmotionButtonProps) {
  return (
    <button className={`emotion-button emotion-button-${tone}`} type="button">
      <span aria-hidden="true">{emoji}</span>
      <strong>{label}</strong>
    </button>
  );
}
