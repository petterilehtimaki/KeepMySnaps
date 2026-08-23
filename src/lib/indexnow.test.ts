import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { INDEXNOW_KEY, INDEXNOW_KEY_FILE } from "./indexnow.ts";

test("the published key file still matches the key we submit with", () => {
  const path = join(import.meta.dirname, "../../public", INDEXNOW_KEY_FILE);
  assert.equal(readFileSync(path, "utf8").trim(), INDEXNOW_KEY);
});

test("the key is long enough for IndexNow to accept it", () => {
  assert.match(INDEXNOW_KEY, /^[a-zA-Z0-9-]{8,128}$/);
});
