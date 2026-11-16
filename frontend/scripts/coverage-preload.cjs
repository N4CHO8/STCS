// Test-only IPC flush: Windows may terminate a child before V8 writes coverage.
const v8 = require("node:v8");
process.on("message", (message) => {
  if (message === "stcs-flush-coverage") {
    v8.takeCoverage();
    process.send?.("stcs-coverage-flushed");
  }
});
