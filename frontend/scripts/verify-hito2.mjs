import { readFileSync } from "node:fs";

const baseUrl = process.env.STCS_BASE_URL ?? "http://localhost:3000";

const parseEnv = (content) => Object.fromEntries(
  content.split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    })
);

const env = {
  ...parseEnv(readFileSync(new URL("../../.env", import.meta.url), "utf8")),
  ...parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"))
};

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path}: ${payload.message ?? response.status}`);
  }

  return payload;
};

const login = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "cuidadora@stcs.local", password: "Demo1234!" })
});
const authHeaders = { Authorization: `Bearer ${login.token}` };
const overview = await request("/api/stcs/overview", { headers: authHeaders });
const pictograms = overview.data.pictograms;
const expectedCategories = ["Necesidades", "Emociones", "Acciones", "Lugares"];

for (const category of expectedCategories) {
  const categoryItems = pictograms.filter((item) => item.category === category);
  if (categoryItems.length < 5 || categoryItems.length > 8) {
    throw new Error(`${category} debe contener entre cinco y ocho pictogramas.`);
  }
}

if (pictograms.some((item) => !item.imagePath?.startsWith("/pictograms/"))) {
  throw new Error("Todos los pictogramas deben tener una imagen compatible con el ESP32.");
}

const deviceConfig = await request(
  `/api/stcs/devices/${overview.data.device.code}/config`,
  { headers: { "x-stcs-device-key": env.STCS_DEVICE_API_KEY } }
);

if (deviceConfig.data.pictograms.length !== pictograms.length) {
  throw new Error("La API del ESP32 no entrega el mismo catalogo que la plataforma web.");
}

console.log("Hito 2 verificado correctamente sin crear datos de prueba.");
console.log(`Catalogo web y ESP32: ${pictograms.length} pictogramas paginados correctamente.`);
