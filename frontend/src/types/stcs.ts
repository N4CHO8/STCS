export type TabId = "dashboard" | "communicator" | "history" | "progress" | "devices";

export type StudentProfile = {
  id: string;
  childUserId: string;
  displayName: string;
  age: number;
  supportLevel: string;
  mainContext: string;
};

export type DeviceInfo = {
  id: string;
  code: string;
  name: string;
  status: string;
  batteryLevel: number;
  wifiSsid: string | null;
  firmwareVersion: string;
  lastSyncAt: string | null;
};

export type PictogramConfig = {
  id: string;
  label: string;
  message: string;
  category: string;
  colorTone: string;
  iconName: string;
  position: number;
};

export type DeviceEvent = {
  id: string;
  eventType: string;
  actionLabel: string;
  context: string;
  actorName: string;
  emotion: string | null;
  intensity: number | null;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type StcsOverview = {
  user: {
    id: string;
    name: string;
    role: string;
  };
  profile: StudentProfile;
  device: DeviceInfo;
  pictograms: PictogramConfig[];
  metrics: {
    interactionsToday: number;
    emotionsToday: number;
    deviceStatus: string;
  };
  weeklyUse: Array<{ day: string; interactions: number }>;
  categoryUse: Array<{ name: string; value: number }>;
  emotionProgress: Array<{ day: string; positive: number; difficult: number }>;
  recentActivity: DeviceEvent[];
};
