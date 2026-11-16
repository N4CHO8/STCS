import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Test-only resolver: execute the same TypeScript validators used by Next.js,
// including its @/ alias, without starting a server or opening a database.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/"))
      specifier = new URL(`../src/${specifier.slice(2)}`, import.meta.url).href;
    if (specifier.startsWith(".") || specifier.startsWith("file:")) {
      const url = new URL(specifier, context.parentURL ?? import.meta.url);
      if (
        !/\.[a-z]+$/i.test(url.pathname) &&
        existsSync(fileURLToPath(url) + ".ts")
      )
        specifier = url.href + ".ts";
    }
    return next(specifier, context);
  },
});
