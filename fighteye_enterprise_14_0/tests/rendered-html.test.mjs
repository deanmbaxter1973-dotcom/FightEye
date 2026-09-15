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
  assert.match(html, /<title>FightEye Enterprise 14.0/);
  assert.match(html, /Your next action/);
  assert.match(html, /What needs attention/);
  assert.match(html, /Review 2 competition entries/);
  assert.match(html, /Profiles and progress/);
  assert.match(html, /Plan and improve/);
  assert.match(html, /Prepare and review/);
  assert.match(html, /Fight-day command/);
  assert.match(html, /People and resources/);
  assert.match(html, /Welfare and controls/);
  assert.match(html, /Open fight tracker/);
  assert.match(html, /Primary navigation/);
  assert.match(html, /Guided fight operations/);
  assert.match(html, /Find anything/);
  assert.match(html, /Fight-day command/);
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

test("provides an enhanced live fight tracking workflow", async () => {
  const source = await readFile(new URL("../app/competition-live-suite.tsx", import.meta.url), "utf8");

  assert.match(source, /FIGHT DAY FOCUS/);
  assert.match(source, /Search athlete, opponent or ring/);
  assert.match(source, /ADJUSTED CALL/);
  assert.match(source, /Mark athlete ready/);
  assert.match(source, /fighteye-live-alerts-v1/);
  assert.match(source, /Clear filters/);
  assert.match(source, /PHASE 87 · FIGHT DAY FOCUS/);
  assert.match(source, /fighteye-fight-day-focus-v1/);
  assert.match(source, /Working offline/);
});

test("provides simple hub navigation, search and device shortcuts", async () => {
  const source = await readFile(new URL("../app/experience-hub.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /PHASE 85 · SIMPLER NAVIGATION/);
  assert.match(source, /Find anything in FightEye/);
  assert.match(source, /QUICK ACCESS/);
  assert.match(page, /fighteye-favourite-tools-v1/);
  assert.match(page, /fighteye-recent-tools-v1/);
  assert.match(page, /Enterprise 14\.0/);
});

test("provides guided context, today priorities and one-tap actions", async () => {
  const source = await readFile(new URL("../app/experience-hub.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/guided-experience.css", import.meta.url), "utf8");

  assert.match(source, /PHASE 89 · TODAY/);
  assert.match(source, /PHASE 88 ·/);
  assert.match(source, /PHASE 90 · ONE-TAP ACTIONS/);
  assert.match(source, /Back to /);
  assert.match(source, /Add athlete/);
  assert.match(source, /Open fight tracker/);
  assert.match(css, /@media\(max-width:900px\) and \(hover:none\)/);
  assert.doesNotMatch(css, /\.toolContext\{[^}]*(fixed|sticky)/);
});

test("connects ringside welfare, incident and return phases", async () => {
  const source = await readFile(new URL("../app/athlete-welfare.tsx", import.meta.url), "utf8");

  assert.match(source, /fighteye-ringside-welfare-v1/);
  assert.match(source, /fighteye-welfare-incidents-v1/);
  assert.match(source, /fighteye-return-clearance-v1/);
  assert.match(source, /fighteye-squad-selection-v1/);
  assert.match(source, /fighteye-live-bouts-v1/);
  assert.match(source, /fighteye-athlete-load-v1/);
  assert.match(source, /Open load &amp; availability/);
});

test("connects emergency contacts, care escalation and welfare handover", async () => {
  const source = await readFile(new URL("../app/welfare-coordination.tsx", import.meta.url), "utf8");

  assert.match(source, /fighteye-emergency-contacts-v1/);
  assert.match(source, /fighteye-care-escalations-v1/);
  assert.match(source, /fighteye-welfare-handover-v1/);
  assert.match(source, /fighteye-welfare-incidents-v1/);
  assert.match(source, /fighteye-ringside-welfare-v1/);
  assert.match(source, /fighteye-return-clearance-v1/);
  assert.match(source, /Review incidents/);
});

test("connects guardian updates, athlete check-ins and welfare review", async () => {
  const source = await readFile(new URL("../app/welfare-engagement.tsx", import.meta.url), "utf8");

  assert.match(source, /fighteye-guardian-updates-v1/);
  assert.match(source, /fighteye-athlete-welfare-checkins-v1/);
  assert.match(source, /fighteye-welfare-reviews-v1/);
  assert.match(source, /fighteye-emergency-contacts-v1/);
  assert.match(source, /fighteye-care-escalations-v1/);
  assert.match(source, /Review escalations/);
});

test("connects session register, attendance insights and grading readiness", async () => {
  const source = await readFile(new URL("../app/club-participation.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/club-participation.css", import.meta.url), "utf8");

  assert.match(source, /fighteye-session-register-v1/);
  assert.match(source, /fighteye-attendance-targets-v1/);
  assert.match(source, /fighteye-grading-readiness-v1/);
  assert.match(source, /fighteye-progress-tracking-v1/);
  assert.match(source, /Review attendance evidence/);
  assert.match(css, /@media\(max-width:430px\)/);
  assert.match(css, /touch-action:manipulation/);
  assert.doesNotMatch(css, /position:(fixed|sticky)/);
});

test("connects class planner, drill library and live session command", async () => {
  const source = await readFile(new URL("../app/coaching-session.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/coaching-session.css", import.meta.url), "utf8");

  assert.match(source, /fighteye-class-plans-v1/);
  assert.match(source, /fighteye-drill-library-v1/);
  assert.match(source, /fighteye-live-session-v1/);
  assert.match(source, /fighteye-session-register-v1/);
  assert.match(source, /Open register/);
  assert.match(css, /@media\(max-width:430px\)/);
  assert.match(css, /touch-action:manipulation/);
  assert.doesNotMatch(css, /position:(fixed|sticky)/);
});
