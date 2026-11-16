import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePictogramInput,
  parseDeviceEventInput,
} from "../src/lib/server/validation.ts";
import {
  canReadSensitive,
  canEditBoard,
  isAdultRole,
} from "../src/lib/permissions.ts";
import { uploadedImageId } from "../src/lib/media-contract.ts";
import { DEVICE_PICTOGRAM_ASSETS } from "../src/lib/pictogramCatalog.ts";

const base = { ...DEVICE_PICTOGRAM_ASSETS[0] };
const invalid = (input) =>
  assert.throws(() => parsePictogramInput(input), {
    name: "InputValidationError",
  });

test("CP-RF03-U01: the spoken phrase is independent from the label and image", () => {
  const parsed = parsePictogramInput({
    ...base,
    label: "Vaso",
    message: "Necesito beber agua, por favor",
  });
  assert.equal(parsed.label, "Vaso");
  assert.equal(parsed.message, "Necesito beber agua, por favor");
  assert.equal(parsed.imagePath, base.imagePath);
});
test("CP-RF03-U02: UTF-8 limits prevent truncation on the ESP", () => {
  assert.equal(
    parsePictogramInput({
      ...base,
      label: "a".repeat(31),
      message: "a".repeat(95),
    }).label.length,
    31,
  );
  invalid({ ...base, label: "a".repeat(32) });
  invalid({ ...base, label: "ñ".repeat(16) });
  invalid({ ...base, message: "a".repeat(96) });
  invalid({ ...base, message: "ñ".repeat(48) });
});
test("CP-RF03-U03: empty, malformed and missing input is rejected", () => {
  for (const value of [null, [], "text", 2, {}]) invalid(value);
  for (const field of [
    "label",
    "message",
    "category",
    "colorTone",
    "iconName",
    "imagePath",
  ])
    for (const value of [undefined, 3, "", "   "])
      invalid({ ...base, [field]: value });
});
test("CP-RF03-U04: catalog, uploads, category and positions enforce the contract", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  assert.equal(uploadedImageId(`/api/stcs/images/${id}`), id);
  assert.equal(uploadedImageId("https://third-party.invalid/image.png"), null);
  assert.equal(
    parsePictogramInput({
      ...base,
      imagePath: `/api/stcs/images/${id}`,
      position: 180,
    }).position,
    180,
  );
  assert.equal(
    parsePictogramInput({ ...base, position: null }).position,
    undefined,
  );
  for (const position of [0, 181, 1.2, "1"]) invalid({ ...base, position });
  for (const change of [
    { category: "Otra" },
    { colorTone: "invalid" },
    { iconName: "invalid" },
    { imagePath: "../../secret" },
  ])
    invalid({ ...base, ...change });
});
test("CP-RNF01-U01: adult permissions deny child and unknown roles", () => {
  const expected = {
    therapist: [true, true, true],
    teacher: [true, false, true],
    guardian: [true, true, false],
    admin: [true, false, false],
    child: [false, false, false],
    administrator: [false, false, false],
    "": [false, false, false],
  };
  for (const [role, values] of Object.entries(expected))
    assert.deepEqual(
      [isAdultRole(role), canReadSensitive(role), canEditBoard(role)],
      values,
    );
});
test("CP-RF05-U01: events preserve identifiers, capture time and valid edge values", () => {
  const input = {
    eventType: "pictogram_selected",
    pictogramLabel: "Agua",
    externalEventId: "event-1",
    occurredAt: "2026-11-16T12:00:00Z",
    intensity: 1,
    batteryLevel: 0,
  };
  const parsed = parseDeviceEventInput(input);
  assert.equal(parsed.externalEventId, input.externalEventId);
  assert.equal(parsed.occurredAt, input.occurredAt);
  assert.equal(parsed.context, "Dispositivo");
  assert.equal(parsed.batteryLevel, 0);
  assert.equal(
    parseDeviceEventInput({ ...input, intensity: 5, batteryLevel: 100 })
      .intensity,
    5,
  );
  assert.equal(
    parseDeviceEventInput({ eventType: "device_started", message: "" }).message,
    undefined,
  );
});
test("CP-RF05-U02: invalid selections, event types and numeric ranges fail", () => {
  const bad = (value) =>
    assert.throws(() => parseDeviceEventInput(value), {
      name: "InputValidationError",
    });
  for (const value of [
    { eventType: "unknown" },
    { eventType: "pictogram_selected" },
    { eventType: "pictogram_selected", pictogramId: "not-uuid" },
    { eventType: "device_started", occurredAt: "not-date" },
  ])
    bad(value);
  for (const intensity of [0, 6, 1.1, "1"])
    bad({ eventType: "device_status", intensity });
  for (const batteryLevel of [-1, 101, 0.5, "0"])
    bad({ eventType: "device_status", batteryLevel });
  bad({ eventType: "device_status", context: 4 });
  bad({ eventType: "device_status", context: " " });
  bad({ eventType: "device_status", context: "x".repeat(81) });
});
