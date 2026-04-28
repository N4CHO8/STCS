export interface Emotion {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  note: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface CreateEmotionInput {
  userId: string;
  emotion: string;
  intensity: number;
  note?: string;
  recordedAt?: string;
}
