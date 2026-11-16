import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const fixture = JSON.parse(
  readFileSync(process.env.STCS_E2E_FIXTURE_FILE, "utf8"),
);
test.beforeEach(async ({ page }) => {
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
  await page.goto("/login");
  await page
    .getByLabel("Correo electronico", { exact: true })
    .fill(fixture.accounts[role]);
  await page.getByLabel("Contrasena", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cerrar sesión", exact: true }),
  ).toBeVisible();
}
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
test("CP-RF01-E02: expired server session clears the portal and redirects to login", async ({
  page,
  context,
}) => {
  await login(page);
  await context.clearCookies();
  await page
    .getByRole("button", { name: "Actualizar datos", exact: true })
    .click();
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
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
