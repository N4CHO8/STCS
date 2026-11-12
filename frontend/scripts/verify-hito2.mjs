import { existsSync, readFileSync } from "node:fs";

const baseUrl = process.env.STCS_BASE_URL ?? "http://localhost:3000";

const parseEnv = (content) =>
  Object.fromEntries(
    content
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

const env = {
  ...(existsSync(new URL("../../.env", import.meta.url))
    ? parseEnv(readFileSync(new URL("../../.env", import.meta.url), "utf8"))
    : {}),
  ...(existsSync(new URL("../../.env.local", import.meta.url))
    ? parseEnv(
        readFileSync(new URL("../../.env.local", import.meta.url), "utf8"),
      )
    : {}),
  ...process.env,
};

let sessionCookie;
const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Origin: baseUrl,
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      ...options.headers,
    },
  });
  if (path === "/api/auth/login" && response.ok) {
    sessionCookie = response.headers.get("set-cookie")?.split(";")[0];
    if (!sessionCookie)
      throw new Error("El login no devolvió la cookie de sesión.");
  }
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${path}: ${payload.message ?? response.status}`,
    );
  }

  return payload;
};

if (!env.STCS_VERIFY_EMAIL || !env.STCS_VERIFY_PASSWORD)
  throw new Error(
    "Configura STCS_VERIFY_EMAIL y STCS_VERIFY_PASSWORD; no se utilizan credenciales demo.",
  );
await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: env.STCS_VERIFY_EMAIL,
    password: env.STCS_VERIFY_PASSWORD,
  }),
});
try {
  const overview = await request("/api/stcs/overview");
  const pictograms = overview.data.pictograms;
  const expectedCategories = [
    "Necesidades",
    "Emociones",
    "Acciones",
    "Lugares",
  ];

  for (const category of expectedCategories) {
    const categoryItems = pictograms.filter(
      (item) => item.category === category,
    );
    if (categoryItems.length > 8) {
      throw new Error(
        `${category} debe contener como máximo ocho pictogramas.`,
      );
    }
  }

  if (pictograms.some((item) => !item.imagePath?.startsWith("/pictograms/"))) {
    throw new Error(
      "Todos los pictogramas deben tener una imagen compatible con el ESP32.",
    );
  }

  const deviceConfig = await request(
    `/api/stcs/devices/${overview.data.device.code}/config`,
    { headers: { "x-stcs-device-key": env.STCS_DEVICE_API_KEY } },
  );

  if (deviceConfig.data.pictograms.length !== pictograms.length) {
    throw new Error(
      "La API del ESP32 no entrega el mismo catalogo que la plataforma web.",
    );
  }

  console.log("Hito 2 verificado correctamente sin crear datos de prueba.");
  console.log(
    `Catalogo web y ESP32: ${pictograms.length} pictogramas paginados correctamente.`,
  );
} finally {
  if (sessionCookie) await request("/api/auth/logout", { method: "POST" });
}
