export interface RecordItem {
  id: string;
  userId: string;
  category: string;
  title: string;
  description: string | null;
  observedAt: string;
  createdAt: string;
}

export interface CreateRecordInput {
  userId: string;
  category: string;
  title: string;
  description?: string;
  observedAt?: string;
}
