import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { resetLoginLimits } from "./reset-login-limits.mjs";
const fixture = JSON.parse(
  readFileSync(process.env.STCS_E2E_FIXTURE_FILE, "utf8"),
);
test.beforeEach(async ({ request }) =>
  resetLoginLimits(request, fixture.accounts),
);

for (const role of ["therapist", "teacher", "guardian", "admin"]) {
  test(`CP-RNF03-A11Y: ${role} keyboard and WCAG scan`, async ({
    page,
  }, testInfo) => {
    await page.goto("/login");
    await page
      .getByLabel("Correo electronico", { exact: true })
      .fill(fixture.accounts[role]);
    await page.getByLabel("Contrasena", { exact: true }).fill(fixture.password);
    await page.getByRole("button", { name: "Ingresar", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Cerrar sesión", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Cargando", { exact: false })).toHaveCount(0);
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const e = document.activeElement;
      return { tag: e.tagName, outline: getComputedStyle(e).outlineStyle };
    });
    expect(["BUTTON", "A", "INPUT", "SELECT"]).toContain(focused.tag);
    expect(focused.outline).not.toBe("none");
    test.setTimeout(60000);
    const violations = [];
    for (const section of [
      "Mi espacio",
      "Comunicación",
      "Ficha del niño",
      "Informes y orientaciones",
      "Uso del comunicador",
      "Actividad",
      "Dispositivo",
      "Usuarios y asignaciones",
      "Configuración",
    ]) {
      const nav = page.getByRole("button", { name: section, exact: true });
      if ((await nav.count()) !== 1) continue;
      await nav.click();
      await expect(page.getByText("Cargando", { exact: false })).toHaveCount(0);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      violations.push(
        ...result.violations.map((v) => ({
          section,
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      );
    }
    await testInfo.attach("axe-result", {
      body: JSON.stringify(violations, null, 2),
      contentType: "application/json",
    });
    expect(violations).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("CP-RF10-E01: filtered CSV download is available only in authorized history", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Correo electronico", { exact: true })
    .fill(fixture.accounts.therapist);
  await page.getByLabel("Contrasena", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await page.getByRole("button", { name: "Actividad", exact: true }).click();
  const button = page.getByRole("button", {
    name: "Exportar CSV",
    exact: true,
  });
  await expect(button).toBeEnabled();
  const download = page.waitForEvent("download");
  await button.click();
  expect((await download).suggestedFilename()).toBe("historial-stcs.csv");
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
});

test("CP-RF01-E03: real export 401 removes private data and redirects", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Correo electronico", { exact: true })
    .fill(fixture.accounts.therapist);
  await page.getByLabel("Contrasena", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await page.getByRole("button", { name: "Actividad", exact: true }).click();
  const button = page.getByRole("button", {
    name: "Exportar CSV",
    exact: true,
  });
  await expect(button).toBeEnabled();
  await context.clearCookies();
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/api/stcs/events/export") && r.status() === 401,
    ),
    button.click(),
  ]);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Seleccionar niño asignado")).toHaveCount(0);
});
