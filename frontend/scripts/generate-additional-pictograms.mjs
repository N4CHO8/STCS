// Reproducible public catalog artwork, independent from private user uploads.
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as icons from "lucide-react";
import sharp from "sharp";
import { writeFile, copyFile } from "node:fs/promises";
import additions from "../src/lib/additionalPictograms.json" with { type: "json" };
import { ADDITIONAL_PICTOGRAM_ASSETS } from "../src/lib/pictogramCatalog.ts";

let index = 0;
for (const rows of Object.values(additions)) {
  for (const [label, , icon] of rows) {
    assert.ok(icons[icon], `Unknown catalog icon: ${icon}`);
    const asset = ADDITIONAL_PICTOGRAM_ASSETS[index];
    assert.equal(asset.label, label);
    const symbol = renderToStaticMarkup(
      createElement(icons[icon], {
        x: 16,
        y: 16,
        width: 64,
        height: 64,
        color: "#163247",
        strokeWidth: 2.2,
      }),
    );
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="white"/><circle cx="48" cy="48" r="44" fill="hsl(${(index * 41) % 360},68%,88%)"/>${symbol}</svg>`;
    await sharp(Buffer.from(svg))
      .png()
      .toFile("public" + asset.imagePath);
    index++;
  }
}
assert.equal(index, 74);
await copyFile(
  "node_modules/lucide-react/LICENSE",
  "public/pictograms/LUCIDE-LICENSE.txt",
);
console.log(
  `Generated ${index} public pictograms; names and phrases remain separate.`,
);
