import { Menu, X } from "lucide-react";

import { NAV_TABS } from "@/lib/stcsUi";
import type { TabId } from "@/types/stcs";

import { Brand, TabButton, UserProfile } from "./shared";

type NavigationLayoutProps = {
  activeTab: TabId;
  displayName: string;
  isMenuOpen: boolean;
  onLogout: () => void;
  onSelectTab: (tab: TabId) => void;
  onToggleMenu: () => void;
  roleLabel: string;
};

export function Sidebar({
  activeTab,
  displayName,
  onLogout,
  onSelectTab,
  roleLabel
}: Omit<NavigationLayoutProps, "isMenuOpen" | "onToggleMenu">) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="px-6 py-7">
        <Brand />
      </div>
      <Navigation activeTab={activeTab} onSelectTab={onSelectTab} />
      <div className="mt-auto border-t border-stone-200 p-5">
        <UserProfile displayName={displayName} onLogout={onLogout} roleLabel={roleLabel} />
      </div>
    </aside>
  );
}

export function MobileHeader({
  activeTab,
  isMenuOpen,
  onSelectTab,
  onToggleMenu
}: Pick<NavigationLayoutProps, "activeTab" | "isMenuOpen" | "onSelectTab" | "onToggleMenu">) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white px-5 py-4 lg:hidden">
      <div className="flex items-center justify-between">
        <Brand />
        <button
          aria-label="Abrir menu"
          className="rounded-xl border border-stone-200 p-2 text-stone-500"
          onClick={onToggleMenu}
          type="button"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {isMenuOpen ? (
        <Navigation activeTab={activeTab} className="mt-4" onSelectTab={onSelectTab} />
      ) : null}
    </header>
  );
}

function Navigation({
  activeTab,
  className = "px-4",
  onSelectTab
}: {
  activeTab: TabId;
  className?: string;
  onSelectTab: (tab: TabId) => void;
}) {
  return (
    <nav className={`grid gap-2 ${className}`} aria-label="Navegacion principal">
      {NAV_TABS.map((tab) => (
        <TabButton
          key={tab.id}
          icon={tab.icon}
          isActive={activeTab === tab.id}
          label={tab.label}
          onClick={() => onSelectTab(tab.id)}
        />
      ))}
    </nav>
  );
}
