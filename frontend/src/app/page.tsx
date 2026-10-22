"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { MobileHeader, Sidebar } from "@/components/stcs/layout";
import { Card } from "@/components/stcs/shared";
import {
  CommunicatorView,
  DashboardView,
  DevicesView,
  HistoryView,
  ProgressView
} from "@/components/stcs/views";
import {
  FALLBACK_OVERVIEW,
  isDeviceOnline,
  mapPictogram
} from "@/lib/stcsUi";
import {
  clearAuthSession,
  getAuthSession,
  getRoleLabel,
  type AuthSession
} from "@/lib/auth";
import type { DeviceEvent, PictogramConfig, StcsOverview, TabId } from "@/types/stcs";

type OverviewResponse = {
  data?: StcsOverview;
  message?: string;
};

type HistoryResponse = {
  data?: DeviceEvent[];
  message?: string;
};

const getDisplayName = (session: AuthSession | null, fallbackName: string) =>
  (session?.user.fullName ?? fallbackName).replace("Cuidadora ", "");

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [overview, setOverview] = useState<StcsOverview>(FALLBACK_OVERVIEW);
  const [isLoading, setIsLoading] = useState(true);
  const [historyEvents, setHistoryEvents] = useState<DeviceEvent[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedSession = getAuthSession();

    if (!storedSession) {
      router.replace("/login");
      return;
    }

    setSession(storedSession);

    const loadOverview = async () => {
      try {
        const response = await fetch("/api/stcs/overview", {
          headers: {
            Authorization: `Bearer ${storedSession.token}`
          },
          cache: "no-store"
        });

        if (response.status === 401) {
          clearAuthSession();
          router.replace("/login");
          return;
        }

        const payload = (await response.json()) as OverviewResponse;

        if (!response.ok || !payload.data) {
          setErrorMessage(payload.message ?? "No fue posible cargar la informacion.");
          return;
        }

        setOverview(payload.data);
        setHistoryEvents(payload.data.recentActivity);
        setErrorMessage("");
      } catch {
        setErrorMessage("No fue posible conectar con la API.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOverview();
  }, [router]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const refresh = async () => {
      try {
        const response = await fetch("/api/stcs/overview", {
          headers: { Authorization: `Bearer ${session.token}` },
          cache: "no-store"
        });
        const payload = (await response.json()) as OverviewResponse;

        if (response.ok && payload.data) {
          setOverview(payload.data);
          setHistoryEvents(payload.data.recentActivity);
        }
      } catch {
        // The next interval retries without interrupting the current workflow.
      }
    };

    const interval = window.setInterval(() => void refresh(), 15_000);
    return () => window.clearInterval(interval);
  }, [session]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const loadHistory = async () => {
    if (!session) {
      return;
    }

    setIsHistoryLoading(true);

    try {
      const response = await fetch("/api/stcs/events", {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store"
      });
      const payload = (await response.json()) as HistoryResponse;

      if (!response.ok || !payload.data) {
        setErrorMessage(payload.message ?? "No fue posible cargar el historial.");
        return;
      }

      setHistoryEvents(payload.data);
      setErrorMessage("");
    } catch {
      setErrorMessage("No fue posible conectar con el historial.");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const selectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);

    if (tabId === "history") {
      void loadHistory();
    }
  };

  const handlePictogramSaved = (saved: PictogramConfig) => {
    setOverview((current) => {
      const exists = current.pictograms.some((item) => item.id === saved.id);
      const pictograms = exists
        ? current.pictograms.map((item) => item.id === saved.id ? saved : item)
        : [...current.pictograms, saved];

      return {
        ...current,
        pictograms: pictograms.sort((a, b) => a.position - b.position || a.label.localeCompare(b.label))
      };
    });
  };

  const handlePictogramDeleted = (pictogramId: string) => {
    setOverview((current) => ({
      ...current,
      pictograms: current.pictograms.filter((item) => item.id !== pictogramId)
    }));
  };

  const displayName = getDisplayName(session, overview.user.name);
  const hasDeviceData = isDeviceOnline(overview.device.status, overview.device.lastSyncAt);
  const pictograms = overview.pictograms.map(mapPictogram);
  const roleLabel = getRoleLabel(
    (session?.user.role ?? overview.user.role) as AuthSession["user"]["role"]
  );

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-stone-500">
      <div className="flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          displayName={displayName}
          onLogout={handleLogout}
          onSelectTab={selectTab}
          roleLabel={roleLabel}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader
            activeTab={activeTab}
            isMenuOpen={isMenuOpen}
            onSelectTab={selectTab}
            onToggleMenu={() => setIsMenuOpen((current) => !current)}
          />

          <main className="flex-1 px-5 py-8 lg:px-10">
            <div className="mx-auto max-w-[1090px]">
              {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
              {isLoading ? <LoadingState /> : null}

              {!isLoading && activeTab === "dashboard" ? (
                <DashboardView data={overview} name={displayName} onNavigate={selectTab} />
              ) : null}
              {!isLoading && activeTab === "communicator" ? (
                <CommunicatorView
                  onDeleted={handlePictogramDeleted}
                  onSaved={handlePictogramSaved}
                  pictograms={pictograms}
                  token={session?.token ?? ""}
                />
              ) : null}
              {!isLoading && activeTab === "history" ? (
                <HistoryView
                  events={historyEvents}
                  isRefreshing={isHistoryLoading}
                  onRefresh={() => void loadHistory()}
                />
              ) : null}
              {!isLoading && activeTab === "progress" ? (
                <ProgressView data={overview} />
              ) : null}
              {!isLoading && activeTab === "devices" ? (
                <DevicesView
                  device={overview.device}
                  hasDeviceData={hasDeviceData}
                  onEventSaved={() => void loadHistory()}
                />
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
      {message}
    </div>
  );
}

function LoadingState() {
  return (
    <Card>
      <div className="flex items-center gap-3 text-sm font-semibold text-stone-500">
        <RefreshCw className="h-4 w-4 animate-spin text-[#518b51]" />
        Cargando...
      </div>
    </Card>
  );
}
