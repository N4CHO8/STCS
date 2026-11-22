// Source hashes pin the reviewed symbols. Run explicitly; never during login/build.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const manifestPath = new URL(
  "../public/pictograms/ARASAAC-CATALOG.json",
  import.meta.url,
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const cache = process.env.STCS_ARASAAC_SOURCE_DIR;
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const item of manifest.items) {
  let bytes;
  if (cache) bytes = await readFile(resolve(cache, `${item.arasaacId}.png`));
  else {
    const response = await fetch(item.sourceUrl, {
      signal: AbortSignal.timeout(30000),
    });
    assert.ok(
      response.ok,
      `ARASAAC ${item.arasaacId}: HTTP ${response.status}`,
    );
    assert.match(response.headers.get("content-type") ?? "", /^image\/png/);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  assert.equal(
    digest(bytes),
    item.sourceSha256,
    `Source changed: ${item.label}; review before replacing`,
  );
  const pixels = await sharp(bytes)
    .flatten({ background: "white" })
    .resize(90, 90, { fit: "contain", background: "white" })
    .extend({ top: 3, bottom: 3, left: 3, right: 3, background: "white" })
    .png()
    .toBuffer();
  if (item.imageSha256)
    assert.equal(
      digest(pixels),
      item.imageSha256,
      `Output changed: ${item.label}`,
    );
  item.imageSha256 = digest(pixels);
  await writeFile(
    new URL(`../public${item.imagePath}`, import.meta.url),
    pixels,
  );
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `${manifest.items.length} ARASAAC assets generated; historical exclusions unchanged.`,
);
