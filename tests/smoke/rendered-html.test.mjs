import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the public InOrdo landing page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Know what a project change will break/);
  assert.match(html, /Evidence.*impact.*approval.*undo/i);
  assert.match(html, /href="\/demo"/);
  assert.match(html, /Skip to main content/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|codex-preview/i);
});

test("server-renders the synthetic demo without live-feature claims", async () => {
  const response = await render("/demo");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Synthetic demo workspace/);
  assert.match(html, /Regional Climate Action Summit 2026/);
  assert.match(html, /Impact review pending/);
  assert.match(html, /UI preview only/);
  assert.match(html, /Needs human confirmation/);
  assert.doesNotMatch(html, /AI verified|changes applied|notification sent/i);
});
