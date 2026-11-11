import type { StcsOverview, PictogramConfig, DeviceEvent } from "./stcs";
import type { AdultRole } from "@/lib/permissions";
export type ChildSummary = { id: string; label: string; number: number };
export type Report = {
  id: string;
  createdAt: string;
  author: string;
  diagnosis?: string;
  guidance: string;
};
export type ChildDetail = {
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
  profiles: ChildSummary[];
  detail?: ChildDetail;
  settings: { appTitle: string; supportEmail: string };
  users?: ManagedUser[];
};
