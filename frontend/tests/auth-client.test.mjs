import test from "node:test";
import assert from "node:assert/strict";
import {
  portalFetch,
  saveAuthSession,
  AUTH_EVENT_KEY,
} from "../src/lib/auth.ts";

test("CP-RF01-U02: stale or aborted 401 cannot invalidate a newer login", async () => {
  const previousFetch = globalThis.fetch;
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const window = new EventTarget();
  let expired = 0;
  window.addEventListener(AUTH_EVENT_KEY, () => expired++);
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: window,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { removeItem() {}, setItem() {} },
  });
  try {
    let resolveOld;
    globalThis.fetch = () => new Promise((done) => (resolveOld = done));
    const old = portalFetch("/api/stcs/events");
    saveAuthSession({});
    resolveOld(new Response("{}", { status: 401 }));
    await old;
    assert.equal(
      expired,
      0,
      "A response from the old session must not clear the new one",
    );
    globalThis.fetch = async () => new Response("{}", { status: 401 });
    await portalFetch("/api/stcs/events");
    assert.equal(expired, 1);
    const controller = new AbortController();
    controller.abort();
    await portalFetch("/api/stcs/events", { signal: controller.signal });
    assert.equal(expired, 1);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow)
      Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousStorage)
      Object.defineProperty(globalThis, "localStorage", previousStorage);
    else delete globalThis.localStorage;
  }
});
