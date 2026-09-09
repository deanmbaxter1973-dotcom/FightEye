import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders the unified FightEye Enterprise application", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
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

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>FightEye Enterprise 11.8/);
  assert.match(html, /Fight database/);
  assert.match(html, /Coach command/);
  assert.match(html, /Club mission/);
  assert.match(html, /Event replay/);
  assert.match(html, /Competitions/);
  assert.match(html, /Entry planner/);
  assert.match(html, /Event pack/);
  assert.match(html, /Live ring board/);
  assert.match(html, /Coach clashes/);
  assert.match(html, /Results &amp; medals/);
  assert.match(html, /Post-event review/);
  assert.match(html, /Development plans/);
  assert.match(html, /Progress tracking/);
  assert.match(html, /Season planner/);
  assert.match(html, /Action centre/);
  assert.match(html, /Load &amp; availability/);
  assert.match(html, /Squad selection/);
  assert.match(html, /Logistics &amp; budget/);
  assert.match(html, /Event launch/);
  assert.match(html, /Team itinerary/);
  assert.match(html, /Team briefing/);
  assert.match(html, /Event closeout/);
  assert.match(html, /Event cost sharing/);
  assert.match(html, /Funding hub/);
  assert.match(html, /Finance control/);
  assert.match(html, /Equipment inventory/);
  assert.match(html, /Kit allocation/);
  assert.match(html, /Safety &amp; compliance/);
  assert.match(html, /Primary navigation/);
  assert.match(html, /Equipment &amp; safety/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("uses stable iPhone scroll layers", async () => {
  const css = await readFile(new URL("../app/iphone.css", import.meta.url), "utf8");

  assert.match(css, /body\{height:100%;overflow:hidden/);
  assert.match(css, /\.app\{display:flex;height:100%;min-height:0/);
  assert.match(css, /\.workspace\{[^}]*overflow-y:auto/);
  assert.match(css, /\.workspace>header\{position:relative/);
  assert.match(css, /\.mobileDock\{position:relative/);
  assert.doesNotMatch(css, /\.workspace>header[^}]*(sticky|translate3d|contain:paint)/);
  assert.doesNotMatch(css, /\.mobileDock[^}]*(fixed|translate3d|contain:layout paint)/);
});

test("connects the event execution phases to saved pathway data", async () => {
  const source = await readFile(new URL("../app/event-execution.tsx", import.meta.url), "utf8");

  assert.match(source, /fighteye-event-logistics-v1/);
  assert.match(source, /fighteye-squad-selection-v1/);
  assert.match(source, /fighteye-team-itinerary-v1/);
  assert.match(source, /fighteye-team-briefing-v1/);
  assert.match(source, /fighteye-event-closeout-v1/);
  assert.match(source, /Open post-event review/);
});

test("connects club finance to event closeout and squad data", async () => {
  const source = await readFile(new URL("../app/club-finance.tsx", import.meta.url), "utf8");

  assert.match(source, /fighteye-event-closeout-v1/);
  assert.match(source, /fighteye-squad-selection-v1/);
  assert.match(source, /fighteye-cost-sharing-v1/);
  assert.match(source, /fighteye-funding-hub-v1/);
  assert.match(source, /fighteye-finance-control-v1/);
  assert.match(source, /Review athlete cost sharing/);
});

test("connects equipment, kit allocation and safety compliance", async () => {
  const source = await readFile(new URL("../app/equipment-safety.tsx", import.meta.url), "utf8");

  assert.match(source, /fighteye-equipment-inventory-v1/);
  assert.match(source, /fighteye-kit-allocation-v1/);
  assert.match(source, /fighteye-safety-compliance-v1/);
  assert.match(source, /fighteye-squad-selection-v1/);
  assert.match(source, /Review athlete kit/);
});
