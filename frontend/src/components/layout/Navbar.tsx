"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="brand-block">
        <span className="brand-badge">STCS</span>
        <div>
          <p className="brand-title">Sistema TEA de Comunicacion y Seguimiento</p>
          <p className="brand-subtitle">
            Base visual y tecnica para avanzar por historias de usuario.
          </p>
        </div>
      </div>

      <nav aria-label="Principal" className="site-nav">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "nav-link nav-link-active" : "nav-link"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
