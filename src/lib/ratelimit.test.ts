import { test } from "node:test";
import assert from "node:assert/strict";
import { clientKey, rateLimit, resetRateLimits } from "./ratelimit.ts";

test("lets a normal run of requests through and stops a loop", () => {
  resetRateLimits();
  const now = 1_000_000;
  for (let i = 0; i < 5; i++) {
    assert.equal(rateLimit("contact:1.2.3.4", 5, 60_000, now).allowed, true);
  }
  const blocked = rateLimit("contact:1.2.3.4", 5, 60_000, now);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 60);
});

test("the window resets, and one caller can't block another", () => {
  resetRateLimits();
  const now = 2_000_000;
  for (let i = 0; i < 6; i++) rateLimit("contact:1.2.3.4", 5, 60_000, now);

  // A different address is unaffected.
  assert.equal(rateLimit("contact:5.6.7.8", 5, 60_000, now).allowed, true);
  // And the first one is welcome back once its window has passed.
  assert.equal(rateLimit("contact:1.2.3.4", 5, 60_000, now + 60_001).allowed, true);
});

test("separates the buckets and falls back when there's no address", () => {
  const request = new Request("https://example.com", {
    headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" },
  });
  assert.equal(clientKey(request, "checkout"), "checkout:9.9.9.9");
  assert.equal(clientKey(new Request("https://example.com"), "contact"), "contact:unknown");
});
