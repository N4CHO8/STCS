import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  ALL_PICTOGRAM_ASSETS,
  ADDITIONAL_PICTOGRAM_ASSETS,
  DEVICE_IMAGE_PATHS,
  getCatalogAsset,
  getImageSourceLabel,
  REVIEW_PENDING_IMAGE_PATHS,
} from "../src/lib/pictogramCatalog.ts";

const manifest = JSON.parse(
  await readFile(
    new URL("../public/pictograms/ARASAAC-CATALOG.json", import.meta.url),
    "utf8",
  ),
);
test("reviewed ARASAAC assets have matching provenance, pixels and stable IDs", async () => {
  assert.equal(ALL_PICTOGRAM_ASSETS.length, 91);
  assert.equal(new Set(ALL_PICTOGRAM_ASSETS.map((a) => a.id)).size, 91);
  assert.equal(manifest.items.length, 91);
  for (const item of manifest.items) {
    const asset = ALL_PICTOGRAM_ASSETS.find((a) => a.id === item.id);
    assert.ok(asset, item.label);
    assert.equal(asset.label, item.label);
    assert.equal(asset.imagePath, item.imagePath);
    assert.equal(asset.category, item.category);
    assert.equal(asset.message, item.defaultMessage);
    assert.equal(asset.position, item.position);
    assert.equal(Number(asset.id.slice(-12)), asset.position);
    assert.equal(
      item.sourceUrl,
      `https://api.arasaac.org/v1/pictograms/${item.arasaacId}`,
    );
    assert.match(item.sourceSha256, /^[a-f0-9]{64}$/);
    assert.ok(item.keywords.length, item.label);
    const bytes = await readFile(
      new URL(`../public${item.imagePath}`, import.meta.url),
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      item.imageSha256,
      item.label,
    );
    const meta = await sharp(bytes).metadata();
    assert.equal(meta.width, 96);
    assert.equal(meta.height, 96);
    // Same dimensions used by device normalization: each RGB565 image remains 18,432 bytes.
    const raw = await sharp(bytes)
      .removeAlpha()
      .toColourspace("srgb")
      .raw()
      .toBuffer();
    assert.equal((raw.length / 3) * 2, 18432);
    assert.equal(getImageSourceLabel(item.imagePath), "ARASAAC");
  }
});
test("unreviewed symbols leave the selector but historical paths and bytes remain", async () => {
  assert.equal(REVIEW_PENDING_IMAGE_PATHS.size, 3);
  assert.equal(DEVICE_IMAGE_PATHS.size, 94);
  for (const item of manifest.excluded) {
    assert.ok(REVIEW_PENDING_IMAGE_PATHS.has(item.imagePath));
    assert.ok(!ALL_PICTOGRAM_ASSETS.some((a) => a.id === item.id));
    assert.ok(!ADDITIONAL_PICTOGRAM_ASSETS.some((a) => a.id === item.id));
    assert.equal(getCatalogAsset(item.imagePath)?.id, item.id);
    assert.match(getImageSourceLabel(item.imagePath), /pendiente/);
    const bytes = await readFile(
      new URL(`../public${item.imagePath}`, import.meta.url),
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      item.legacySha256,
    );
  }
});
test("own images are not falsely attributed to ARASAAC", () => {
  assert.equal(getImageSourceLabel("/api/stcs/images/123"), "Imagen propia");
  assert.equal(getImageSourceLabel(undefined), "");
  assert.equal(getImageSourceLabel("https://example.com/x.png"), "");
});
