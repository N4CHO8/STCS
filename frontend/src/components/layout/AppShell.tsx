"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "./Navbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const usesStandaloneLayout = pathname === "/" || pathname === "/login";

  if (usesStandaloneLayout) {
    return <main>{children}</main>;
  }

  return (
    <div className="page-frame">
      <div className="content-shell">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
