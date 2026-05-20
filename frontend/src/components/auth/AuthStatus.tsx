"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAuthSession, getAuthSession, getRoleLabel } from "@/lib/auth";

export function AuthStatus() {
  const [sessionInfo, setSessionInfo] = useState<{
    fullName: string;
    roleLabel: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      setSessionInfo(null);
      return;
    }

    setSessionInfo({
      fullName: session.user.fullName,
      roleLabel: getRoleLabel(session.user.role)
    });
  }, [pathname]);

  if (!sessionInfo) {
    return (
      <div className="auth-pill auth-pill-guest">
        <span>Sesion no iniciada</span>
        <Link href="/login" className="auth-pill-link">
          Ingresar
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    clearAuthSession();
    setSessionInfo(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="auth-pill auth-pill-user">
      <div>
        <strong>{sessionInfo.fullName}</strong>
        <span>{sessionInfo.roleLabel}</span>
      </div>
      <button type="button" className="auth-pill-button" onClick={handleLogout}>
        Cerrar sesion
      </button>
    </div>
  );
}
