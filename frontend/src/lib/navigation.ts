export const navigationItems = [
  { href: "/", label: "Inicio" },
  { href: "/communication", label: "Comunicacion" },
  { href: "/emotions", label: "Emociones" },
  { href: "/history", label: "Seguimiento" },
  { href: "/login", label: "Login" }
];

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
