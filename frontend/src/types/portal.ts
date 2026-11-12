import type { StcsOverview, PictogramConfig, DeviceEvent } from "./stcs";
import type { AdultRole } from "@/lib/permissions";
export type ChildSummary = {
  id: string;
  label: string;
  number: number;
  isDemo?: boolean;
  isPrivateTest?: boolean;
};
export type Report = {
  id: string;
  createdAt: string;
  author: string;
  diagnosis?: string;
  guidance: string;
};
export type DeviceSummary = {
  firmwareVersion?: string;
  code: string;
  status: string;
  lastSyncAt: string | null;
  powerSource: "usb" | "battery" | "unknown";
  batteryLevel: number | null;
};
export type ChildDetail = {
  devices?: DeviceSummary[];
  profile: ChildSummary & {
    fullName?: string;
    age?: number;
    supportLevel?: string;
    mainContext?: string;
    notes?: string;
  };
  reports: Report[];
  pictograms: PictogramConfig[];
  overview?: StcsOverview;
  history?: DeviceEvent[];
};
export type ManagedUser = {
  id: string;
  fullName: string;
  email: string;
  role: AdultRole;
  active: boolean;
  isDemo?: boolean;
  isPrivateTest?: boolean;
  verified?: boolean;
  profileIds: string[];
  pendingProfileIds?: string[];
};
export type PortalData = {
  pendingApprovals?: {
    profileId: string;
    number: number;
    actorId: string;
    name: string;
    email: string;
    role: string;
  }[];
  role: AdultRole;
  isDemo?: boolean;
  isPrivateTest?: boolean;
  profiles: ChildSummary[];
  detail?: ChildDetail;
  settings: { appTitle: string; supportEmail: string };
  users?: ManagedUser[];
};
