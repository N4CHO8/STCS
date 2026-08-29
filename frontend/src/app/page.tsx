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
  mapPictogram
} from "@/lib/stcsUi";
import {
  clearAuthSession,
  getAuthSession,
  getRoleLabel,
  type AuthSession
} from "@/lib/auth";
import type { StcsOverview, TabId } from "@/types/stcs";

type OverviewResponse = {
  data?: StcsOverview;
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
        setErrorMessage("");
      } catch {
        setErrorMessage("No fue posible conectar con la API.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOverview();
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const selectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const displayName = getDisplayName(session, overview.user.name);
  const hasDeviceData = overview.recentActivity.length > 0;
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
                <DashboardView data={overview} name={displayName} />
              ) : null}
              {!isLoading && activeTab === "communicator" ? (
                <CommunicatorView pictograms={pictograms} />
              ) : null}
              {!isLoading && activeTab === "history" ? (
                <HistoryView events={overview.recentActivity} />
              ) : null}
              {!isLoading && activeTab === "progress" ? (
                <ProgressView data={overview} />
              ) : null}
              {!isLoading && activeTab === "devices" ? (
                <DevicesView device={overview.device} hasDeviceData={hasDeviceData} />
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
