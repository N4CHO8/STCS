import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resetLoginLimits } from "./reset-login-limits.mjs";

const fixture = JSON.parse(
  readFileSync(process.env.STCS_E2E_FIXTURE_FILE, "utf8"),
);
test.beforeAll(async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect((await response.json()).testDatabase).toBe(
    "127.0.0.1:55432/stcs_release_tests",
  );
});
test.beforeEach(async ({ page, request }) => {
  await resetLoginLimits(request, fixture.accounts);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /Refused to execute|violates.*Content Security Policy/i.test(
        message.text(),
      )
    )
      errors.push(message.text());
  });
  page.__criticalErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.__criticalErrors).toEqual([]);
});
async function login(page, role = "therapist") {
  if (!/\/login$/.test(page.url())) await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Iniciar sesion", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Correo electronico", { exact: true })
    .fill(fixture.accounts[role]);
  await page.getByLabel("Contrasena", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cerrar sesión", exact: true }),
  ).toBeVisible();
  const identity = await page.request.get("/api/auth/me");
  expect((await identity.json()).user.role).toBe(role);
}

test("CP-RF03-ARASAAC: public credits and complete catalog images without unreviewed choices", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByRole("link", { name: "Créditos de imágenes", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Créditos de los recursos gráficos" }),
  ).toBeVisible();
  await expect(page.getByText(/Autor: Sergio Palao/)).toBeVisible();
  const registry = await page.request.get("/pictograms/ARASAAC-CATALOG.json");
  expect(registry.ok()).toBe(true);
  const manifest = await registry.json();
  expect(manifest.items).toHaveLength(91);
  await login(page);
  await expect(
    page.getByRole("link", { name: "Créditos de imágenes", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Seleccionar niño asignado")
    .selectOption(fixture.profiles[0]);
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  await page
    .getByRole("button", { name: "Agregar", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  for (const category of ["Necesidades", "Emociones", "Acciones", "Lugares"]) {
    await dialog
      .getByRole("combobox", { name: "Categoria", exact: true })
      .selectOption(category);
    const choices = dialog.getByRole("button", { name: /^Usar imagen / });
    expect(await choices.count()).toBe(
      manifest.items.filter((a) => a.category === category).length,
    );
    await expect
      .poll(() =>
        choices
          .locator("img")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image.complete &&
                image.naturalWidth === 96 &&
                image.naturalHeight === 96,
            ),
          ),
      )
      .toBe(true);
  }
  await dialog
    .getByRole("combobox", { name: "Categoria", exact: true })
    .selectOption("Emociones");
  for (const label of ["Inseguridad", "Frustración", "Entusiasmo"]) {
    await expect(
      dialog.getByRole("button", { name: `Usar imagen ${label}`, exact: true }),
    ).toHaveCount(0);
  }
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
});

test("CP-ADAPT-E01: specialist selects visible categories, persists and restores the catalog", async ({
  page,
}) => {
  await login(page);
  await page
    .getByLabel("Seleccionar niño asignado")
    .selectOption(fixture.profiles[0]);
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  const settings = page.getByRole("group", {
    name: "Categorías y pictogramas visibles",
  });
  await expect(settings).toBeVisible();
  const target = `/api/stcs/pictograms?profileId=${fixture.profiles[0]}`;
  const created = await page.request.post(target, {
    headers: { Origin: "http://127.0.0.1:3400" },
    data: {
      label: "Opción adaptable",
      message: "Estoy feliz",
      category: "Emociones",
      colorTone: "yellow",
      iconName: "Smile",
      imagePath: "/pictograms/happy.png",
      position: 2,
    },
  });
  expect(created.status()).toBe(201);
  const id = (await created.json()).data.id;
  try {
    await page.reload();
    await page
      .getByRole("button", { name: "Comunicación", exact: true })
      .click();
    await settings.getByLabel("Emociones (1/1)", { exact: true }).uncheck();
    const save = page.getByRole("button", {
      name: "Guardar selección del ESP",
      exact: true,
    });
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/stcs/portal") && r.request().method() === "POST",
    );
    await save.click();
    expect((await saved).ok()).toBe(true);
    await page.reload();
    await page
      .getByRole("button", { name: "Comunicación", exact: true })
      .click();
    await expect(
      settings.getByLabel("Emociones (0/1)", { exact: true }),
    ).not.toBeChecked();
    await expect(
      page.getByText("Opción adaptable", { exact: true }),
    ).toBeVisible();
    await settings.getByLabel(/Necesidades \(/).uncheck();
    await expect(save).toBeDisabled();
    const restored = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/stcs/portal") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Mostrar todo el catálogo", exact: true })
      .click();
    expect((await restored).ok()).toBe(true);
    await page.reload();
    await page
      .getByRole("button", { name: "Comunicación", exact: true })
      .click();
    await expect(
      settings.getByLabel("Emociones (1/1)", { exact: true }),
    ).toBeChecked();
  } finally {
    await page.request.post("/api/stcs/portal", {
      headers: { Origin: "http://127.0.0.1:3400" },
      data: {
        action: "boardSelection",
        profileId: fixture.profiles[0],
        selection: null,
      },
    });
    await page.request.delete(
      `/api/stcs/pictograms/${id}?profileId=${fixture.profiles[0]}`,
      {
        headers: { Origin: "http://127.0.0.1:3400" },
      },
    );
  }
});

test("CP-ADAPT-E02: teacher sees selection information without specialist controls", async ({
  page,
}) => {
  await login(page, "teacher");
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  await expect(
    page.getByText("Tablero visible en el ESP", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Guardar selección del ESP",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("CP-FOLLOW-E01: specialist start date and teacher observation persist with role boundaries", async ({
  page,
}) => {
  await login(page);
  await page
    .getByLabel("Seleccionar niño asignado")
    .selectOption(fixture.profiles[0]);
  await page
    .getByRole("button", { name: "Ficha del niño", exact: true })
    .click();
  await page.getByLabel("Fecha de inicio", { exact: true }).fill("2020-01-02");
  await page
    .getByRole("button", { name: "Guardar fecha de inicio", exact: true })
    .click();
  await expect(page.getByLabel("Fecha de inicio", { exact: true })).toHaveValue(
    "2020-01-02",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Ficha del niño", exact: true })
    .click();
  await expect(page.getByLabel("Fecha de inicio", { exact: true })).toHaveValue(
    "2020-01-02",
  );
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page, "teacher");
  await page
    .getByRole("button", { name: "Orientaciones", exact: true })
    .click();
  const text = "Observación E2E de comunicación: pidió agua con apoyo visual.";
  await page
    .getByLabel("Observación para el especialista", { exact: true })
    .fill(text);
  await page
    .getByRole("button", { name: "Enviar observación", exact: true })
    .click();
  await expect(page.getByText(text, { exact: true })).toBeVisible();
  await expect(
    page.getByText("DIAGNOSTICO_PRIVADO", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await page
    .getByLabel("Seleccionar niño asignado")
    .selectOption(fixture.profiles[0]);
  await page
    .getByRole("button", { name: "Informes y orientaciones", exact: true })
    .click();
  await expect(page.getByText(text, { exact: true })).toBeVisible();
  await page
    .getByLabel("Seleccionar niño asignado")
    .selectOption(fixture.profiles[1]);
  await expect(page.getByText(text, { exact: true })).toHaveCount(0);
});
test("CP-RF01-E01: direct URL requires login and invalid credentials show an error", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await page
    .getByLabel("Correo electronico", { exact: true })
    .fill(fixture.accounts.therapist);
  await page.getByLabel("Contrasena", { exact: true }).fill("incorrecta");
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page.getByText(/Credenciales invalidas/i)).toBeVisible();
});
test("CP-RF02-E01: specialist selects assigned children and reads the clinical file", async ({
  page,
}) => {
  await login(page);
  const select = page.getByLabel("Seleccionar niño asignado");
  await expect(select.locator("option")).toHaveCount(2);
  await select.selectOption(fixture.profiles[0]);
  await page
    .getByRole("button", { name: "Ficha del niño", exact: true })
    .click();
  await expect(
    page.getByText("NOTA_PRIVADA_E2E", { exact: true }),
  ).toBeVisible();
});
test("CP-RF03-E01: create, persist, edit and reject a duplicate through the browser", async ({
  page,
}) => {
  await login(page);
  await page
    .getByLabel("Seleccionar niño asignado")
    .selectOption(fixture.profiles[0]);
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  await page
    .getByRole("button", { name: "Agregar", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre", { exact: true }).fill(fixture.label);
  await dialog
    .getByLabel("Frase asociada", { exact: true })
    .fill(fixture.phrase);
  await dialog
    .getByRole("button", { name: "Usar imagen Agua", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("Consultando voz…", { exact: true })).toHaveCount(
    0,
  );
  await page.reload();
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  await page
    .getByRole("button", { name: `Editar ${fixture.label}`, exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await expect(
    dialog.getByLabel("Frase asociada", { exact: true }),
  ).toHaveValue(fixture.phrase);
  await dialog
    .getByLabel("Frase asociada", { exact: true })
    .fill(fixture.phrase + " por favor");
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page
    .getByRole("button", { name: "Agregar", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre", { exact: true }).fill("Agua");
  await dialog
    .getByLabel("Frase asociada", { exact: true })
    .fill(fixture.phrase);
  await dialog
    .getByRole("button", { name: "Usar imagen Agua", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialog.getByText(/ya existe|duplicad/i)).toBeVisible();
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page
    .getByRole("button", { name: `Editar ${fixture.label}`, exact: true })
    .click();
  page.once("dialog", (confirmation) => confirmation.accept());
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Eliminar", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: `Editar ${fixture.label}`, exact: true }),
  ).toHaveCount(0);
});
test("CP-RF03-E02: invalid upload is rejected and a valid image persists", async ({
  page,
}) => {
  await login(page);
  await page
    .getByLabel("Seleccionar niño asignado")
    .selectOption(fixture.profiles[0]);
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  await page
    .getByRole("button", { name: "Agregar", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Nombre", { exact: true })
    .fill(fixture.label + " foto");
  await dialog
    .getByLabel("Frase asociada", { exact: true })
    .fill(fixture.phrase);
  const input = dialog.locator('input[type="file"]');
  await input.setInputFiles({
    name: "invalido.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(dialog.getByText(/Usa una imagen PNG/)).toBeVisible();
  await input.setInputFiles(resolve("public" + fixture.imagePath));
  await expect(
    dialog.getByAltText("Vista previa del pictograma"),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("Consultando voz…", { exact: true })).toHaveCount(
    0,
  );
  await page.reload();
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  await page
    .getByRole("button", { name: `Editar ${fixture.label} foto`, exact: true })
    .click();
  const image = page
    .getByRole("dialog")
    .getByAltText("Vista previa del pictograma");
  await expect(image).toHaveAttribute("src", /^\/api\/stcs\/images\//);
});
test("CP-RF02-E02: teacher has no clinical controls or private API response", async ({
  page,
}) => {
  await login(page, "teacher");
  await expect(
    page.getByRole("button", { name: "Ficha del niño", exact: true }),
  ).toHaveCount(0);
  const response = await page.request.get("/api/stcs/portal");
  const body = await response.text();
  expect(response.status()).toBe(200);
  expect(body).not.toMatch(
    /ApellidoReservado|NOTA_PRIVADA_E2E|DIAGNOSTICO_PRIVADO|sensitive_notes|"diagnosis"/,
  );
  const denied = await page.request.get(
    `/api/stcs/portal?profileId=${fixture.profiles[1]}`,
  );
  expect(denied.status()).toBe(403);
});
test("CP-RF02-E03: guardian sees only their child and cannot edit the board", async ({
  page,
}) => {
  await login(page, "guardian");
  await expect(
    page.getByLabel("Seleccionar niño asignado").locator("option"),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Ficha del niño", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "Antecedentes e información relevante",
      exact: true,
    }),
  ).toHaveValue("NOTA_PRIVADA_E2E");
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Agregar", exact: true }),
  ).toHaveCount(0);
});
test("CP-RF02-E04: administrator receives numbered profiles without child identities", async ({
  page,
}) => {
  await login(page, "admin");
  const response = await page.request.get("/api/stcs/portal");
  const body = await response.text();
  expect(response.status()).toBe(200);
  expect(body).not.toMatch(
    /PruebaA|PruebaB|ApellidoReservado|NOTA_PRIVADA_E2E|DIAGNOSTICO_PRIVADO/,
  );
  expect(body).toMatch(/Usuario \d/);
  await expect(
    page.getByRole("button", { name: "Ficha del niño", exact: true }),
  ).toHaveCount(0);
});
test("CP-RF01-E02: missing server credential clears the portal and redirects to login", async ({
  page,
  context,
}) => {
  await login(page);
  const refresh = page.getByRole("button", {
    name: "Actualizar datos",
    exact: true,
  });
  await expect(refresh).toBeEnabled();
  await expect(
    page.getByRole("heading", { name: "Mi espacio", exact: true }),
  ).toBeVisible();

  // A pending load or background poll can redirect before Playwright finishes
  // clicking. Hold portal requests until the click completes, then let the real
  // server reject the missing cookie. Never mock the 401 or retry a failed test.
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const portalRoute = "**/api/stcs/portal*";
  await page.route(portalRoute, async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await context.clearCookies();
    const denied = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/stcs/portal" &&
        response.status() === 401,
    );
    await Promise.all([denied, refresh.click().then(() => release())]);
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("button", { name: "Cerrar sesión", exact: true }),
  ).toHaveCount(0);
});
test("CP-RNF03-E01: API failure shows an error and retry recovers", async ({
  page,
}) => {
  await login(page);
  await page.route("**/api/stcs/portal*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Servicio de prueba temporalmente no disponible",
      }),
    }),
  );
  await page
    .getByRole("button", { name: "Actualizar datos", exact: true })
    .click();
  await expect(
    page.getByText("Servicio de prueba temporalmente no disponible", {
      exact: true,
    }),
  ).toBeVisible();
  await page.unroute("**/api/stcs/portal*");
  await page
    .getByRole("button", { name: "Actualizar datos", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mi espacio", exact: true }),
  ).toBeVisible();
});
test("CP-RNF03-E02: mobile navigation fits and logout prevents returning to private data", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "teacher");
  await page.getByRole("button", { name: "Comunicación", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const signedOutCheck = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/auth/me" &&
      response.status() === 401,
  );
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await signedOutCheck;
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Iniciar sesion", exact: true }),
  ).toBeVisible();
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
