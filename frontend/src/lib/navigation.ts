export const navigationItems = [
  { href: "/", label: "Inicio" },
  { href: "/portal", label: "Portal" },
  { href: "/login", label: "Login" }
];

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
