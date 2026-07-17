import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../lib/cn.ts";

test("cn joins present class names and ignores falsey values", () => {
  assert.equal(cn("card", false, undefined, "card--wide", null), "card card--wide");
  assert.equal(cn(undefined, false, null), "");
});
