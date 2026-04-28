import { ReactNode } from "react";

import { Navbar } from "./Navbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="page-frame">
      <div className="ambient-shape ambient-shape-left" aria-hidden="true" />
      <div className="ambient-shape ambient-shape-right" aria-hidden="true" />
      <div className="content-shell">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
