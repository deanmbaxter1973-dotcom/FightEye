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
  assert.match(html, /<title>FightEye Enterprise 14.7/);
  assert.match(html, /Event timeline/);
  assert.match(html, /Current events/);
  assert.match(html, /NEXT EVENT/);
  assert.match(html, />Athletes</);
  assert.match(html, />Events</);
  assert.match(html, />Live</);
  assert.match(html, />Club</);
  assert.match(html, /Primary navigation/);
  assert.match(html, /Guided fight operations/);
  assert.match(html, /Find anything/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("uses stable iPhone scroll layers", async () => {
  const css = await readFile(new URL("../app/iphone.css", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(css, /body\{height:100%;overflow:hidden/);
  assert.match(css, /\.app\{display:flex;height:100%;min-height:0/);
  assert.match(css, /height:100dvh/);
  assert.match(css, /\.workspace\{[^}]*overflow-y:auto/);
  assert.match(css, /\.workspace>header\{position:relative/);
  assert.match(css, /\.mobileDock\{position:relative/);
  assert.match(css, /backdrop-filter:none!important/);
  assert.match(page, /dynamicTool/);
  assert.doesNotMatch(css, /\.workspace>header[^}]*(sticky|translate3d|contain:paint)/);
  assert.doesNotMatch(css, /\.mobileDock[^}]*(fixed|translate3d|contain:layout paint)/);
});

test("makes FightEye installable on iPhone and supported browsers", async () => {
  const source = await readFile(new URL("../app/install-app.tsx", import.meta.url), "utf8");
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  const worker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.scope, "/");
  assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
  assert.match(source, /beforeinstallprompt/);
  assert.match(source, /serviceWorker\.register\("\/sw\.js"\)/);
  assert.match(source, /Add to Home Screen/);
  assert.match(source, /Download FightEye app/);
  assert.match(worker, /fighteye-app-v4/);
  assert.match(worker, /MAX_ENTRIES=80/);
  assert.doesNotMatch(worker, /MAX_AGE|if\(fresh\(cached\)\)/);
  assert.match(source, /controllerchange/);
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
  assert.match(page, /Enterprise 14\.7/);
});

test("restores the filtered current and past event timeline", async () => {
  const source = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/event-timeline.css", import.meta.url), "utf8");

  assert.match(source, /EVENT TIMELINE/);
  assert.match(source, /aria-label=\{`\$\{period\} event timeline`\}/);
  assert.match(source, /Past events/);
  assert.match(source, /layout===\"Timeline\"/);
  assert.match(source, /◷ Timeline/);
  assert.match(source, /NEXT EVENT/);
  assert.match(source, /NEXT ENTRY DEADLINE/);
  assert.match(source, /Filter timeline by month/);
  assert.match(source, /timeline-month-break/);
  assert.match(source, /Entries close in/);
  assert.match(source, /registration ready/);
  assert.match(css, /\.event-timeline-row/);
  assert.match(css, /\.timeline-date-tile/);
  assert.match(css, /\.timeline-glance/);
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /@media\(max-width:470px\)/);
  assert.doesNotMatch(css, /position:(fixed|sticky)/);
});

test("restores the comprehensive event catalogue and working club planner", async () => {
  const source = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const catalogue = await readFile(new URL("../app/event-catalogue.ts", import.meta.url), "utf8");
  const plannerCss = await readFile(new URL("../app/event-planner.css", import.meta.url), "utf8");

  assert.ok((catalogue.match(/id:\"/g) ?? []).length >= 30);
  assert.match(catalogue, /WAKO Children, Cadet & Junior World Championships/);
  assert.match(catalogue, /The Bristol Open 2026/);
  assert.match(catalogue, /Peterborough Championship Series No\. 3/);
  assert.match(catalogue, /ISKA AMA World Championships/);
  assert.match(catalogue, /WKU World Championships/);
  assert.match(source, /events-home-head/);
  assert.match(source, /Club plan/);
  assert.match(source, /Select the club athletes to enter/);
  assert.match(source, /fighteye-event-plans-v2/);
  assert.match(source, /Open registration/);
  assert.match(source, /timeline-details-button/);
  assert.match(source, /timeline-register/);
  assert.match(source, /Register for \$\{event\.name\}/);
  assert.match(source, /<dt>Venue<\/dt>/);
  assert.match(plannerCss, /@media\(max-width:430px\)/);
});

test("audits timeline dates and exposes missing official results", async () => {
  const source = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const catalogue = await readFile(new URL("../app/event-catalogue.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/event-planner.css", import.meta.url), "utf8");

  assert.match(source, /Timeline integrity centre/);
  assert.match(source, /Dates to review/);
  assert.match(source, /Missing results/);
  assert.match(source, /Results complete/);
  assert.match(source, /Check results/);
  assert.match(catalogue, /city:"Berlin",venue:"Estrel Berlin"/);
  assert.match(catalogue, /start:"2026-07-11",end:"2026-07-12"/);
  assert.match(catalogue, /city:"Barnsley",venue:"Barnsley Metrodome"/);
  assert.match(catalogue, /dateStatus:"Corrected"/);
  assert.match(catalogue, /resultStatus:"Complete"/);
  assert.match(catalogue, /resultStatus:"Missing"/);
  assert.match(catalogue, /https:\/\/www\.wako\.sport\/official-results/);
  assert.match(css, /\.integrity-command/);
  assert.match(css, /overscroll-behavior-x:contain/);
});

test("adds registration readiness, event comparison and portable event actions", async () => {
  const source = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/event-planner.css", import.meta.url), "utf8");

  assert.match(source, /PHASE 91 · REGISTRATION READY/);
  assert.match(source, /Licences checked/);
  assert.match(source, /Categories confirmed/);
  assert.match(source, /PHASE 92 · COMPARE EVENTS/);
  assert.match(source, /Compare up to three events at once/);
  assert.match(source, /PHASE 103 · LIVE EVENT BRIDGE/);
  assert.match(source, /Add to calendar/);
  assert.match(source, /Share event/);
  assert.match(source, /BEGIN:VCALENDAR/);
  assert.match(css, /\.registration-readiness/);
  assert.match(css, /\.event-comparison/);
  assert.match(css, /\.event-portability/);
});

test("adds a shared club roster, coaching team and club operations manager", async () => {
  const manager = await readFile(new URL("../app/club-manager.tsx", import.meta.url), "utf8");
  const data = await readFile(new URL("../app/club-data.ts", import.meta.url), "utf8");
  const events = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/club-manager.css", import.meta.url), "utf8");

  assert.match(manager, /PHASES 109–111 · CONNECTED CLUB iOS/);
  assert.match(manager, /PHASE 95 · COACHING TEAM/);
  assert.match(manager, /PHASE 111 · ORGANISATION IDENTITY/);
  assert.match(manager, /Add club athlete/);
  assert.match(manager, /Safeguarding current/);
  assert.match(data, /fighteye-club-athletes-v1/);
  assert.match(events, /readClubAthletes/);
  assert.match(page, /clubManager/);
  assert.match(css, /@media\(max-width:430px\)/);
  assert.match(css, /touch-action|minimum|\.club-manager-tabs/);
  assert.doesNotMatch(css, /position:(fixed|sticky)/);
});

test("adds membership, onboarding and club command phases with iPhone polish", async () => {
  const manager = await readFile(new URL("../app/club-manager.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/club-manager.css", import.meta.url), "utf8");
  const iphone = await readFile(new URL("../app/iphone.css", import.meta.url), "utf8");

  assert.match(manager, /PHASE 97 · MEMBERSHIP CONTROL/);
  assert.match(manager, /PHASE 98 · ATHLETE ONBOARDING/);
  assert.match(manager, /PHASE 99 · CLUB COMMAND/);
  assert.match(manager, /fighteye-membership-control-v1/);
  assert.match(manager, /fighteye-athlete-onboarding-v1/);
  assert.match(manager, /Consent recorded/);
  assert.match(manager, /actions need attention/);
  assert.match(css, /\.membership-list/);
  assert.match(css, /\.onboarding-list/);
  assert.match(css, /\.command-grid/);
  assert.match(css, /overscroll-behavior-x:contain/);
  assert.match(iphone, /\.mobileMoreHead\{position:relative/);
  assert.doesNotMatch(iphone, /\.mobileMoreHead\{position:sticky/);
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

test("connects event timeline, live tracker and club athletes", async () => {
  const links = await readFile(new URL("../app/event-club-links.ts", import.meta.url), "utf8");
  const timeline = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const club = await readFile(new URL("../app/club-manager.tsx", import.meta.url), "utf8");
  const live = await readFile(new URL("../app/competition-live-suite.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(links, /fighteye-event-team-links-v1/);
  assert.match(links, /fighteye-active-live-event-v1/);
  assert.match(timeline, /Event timeline/);
  assert.match(timeline, /Stable athlete IDs/);
  assert.match(club, /PHASE 104 · CLUB EVENT TEAMS/);
  assert.match(club, /athleteIds\.includes\(athlete\.id\)/);
  assert.match(live, /PHASE 103 · ACTIVE EVENT/);
  assert.match(page, /\["clubManager","Club",<AppIcon name="club"/);
});

test("builds the comprehensive automatic past-events archive", async () => {
  const source = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const catalogue = await readFile(new URL("../app/event-catalogue.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/event-timeline.css", import.meta.url), "utf8");

  assert.match(source, /PHASE 106 · COMPREHENSIVE DIRECTORY/);
  assert.match(source, /PHASE 107 · AUTOMATIC EVENT LIFECYCLE/);
  assert.match(source, /PHASE 108 · PAST EVENTS ARCHIVE/);
  assert.match(source, /eventBelongsInPast/);
  assert.match(source, /event\.end<today/);
  assert.match(source, /reverse date order/);
  assert.match(source, /All results/);
  assert.match(catalogue, /Oxford Champions/);
  assert.match(catalogue, /Peterborough Championship Series No\. 1/);
  assert.match(catalogue, /catalogueSources/);
  assert.match(css, /\.past-events-head/);
  assert.doesNotMatch(css, /position:(fixed|sticky)/);
});

test("adds smart timeline, iPhone club command and organisation identity phases", async () => {
  const timeline = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const manager = await readFile(new URL("../app/club-manager.tsx", import.meta.url), "utf8");
  const brand = await readFile(new URL("../app/organisation-brand.tsx", import.meta.url), "utf8");
  const timelineCss = await readFile(new URL("../app/event-timeline.css", import.meta.url), "utf8");
  const clubCss = await readFile(new URL("../app/club-manager.css", import.meta.url), "utf8");

  assert.match(timeline, /PHASE 109 · SMART EVENT TIMELINE/);
  assert.match(timeline, /My club teams/);
  assert.match(timeline, /CLUB TEAM/);
  assert.match(timeline, /OrganisationMark/);
  assert.match(manager, /PHASE 110 · CLUB iOS COMMAND/);
  assert.match(manager, /Run the club with one hand/);
  assert.match(manager, /Upload organisation logo/);
  assert.match(manager, /openLive/);
  assert.match(brand, /fighteye-club-profile-v1/);
  assert.match(brand, /optimiseLogo/);
  assert.match(timelineCss, /\.timeline-team/);
  assert.match(clubCss, /\.ios-quick-actions/);
  assert.doesNotMatch(clubCss, /position:(fixed|sticky)/);
});

test("adds event-team availability, coach allocation and iPhone readiness phases", async () => {
  const links = await readFile(new URL("../app/event-club-links.ts", import.meta.url), "utf8");
  const timeline = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const manager = await readFile(new URL("../app/club-manager.tsx", import.meta.url), "utf8");
  const timelineCss = await readFile(new URL("../app/event-timeline.css", import.meta.url), "utf8");
  const clubCss = await readFile(new URL("../app/club-manager.css", import.meta.url), "utf8");

  assert.match(links, /fighteye-event-team-operations-v1/);
  assert.match(links, /Invited.*Confirmed.*Unavailable/);
  assert.match(manager, /PHASE 112 · ATHLETE AVAILABILITY/);
  assert.match(manager, /PHASE 113 · COACH ALLOCATION/);
  assert.match(manager, /PHASE 114 · TEAM READINESS/);
  assert.match(manager, /Team readiness/);
  assert.match(timeline, /TEAM READY/);
  assert.match(clubCss, /.availability-row/);
  assert.match(clubCss, /.coach-allocation/);
  assert.match(timelineCss, /.timeline-team-readiness/);
  assert.doesNotMatch(clubCss, /position:(fixed|sticky)/);
  assert.doesNotMatch(timelineCss, /position:(fixed|sticky)/);
});

test("makes the improved event timeline the main page in 14.7", async () => {
  const source = await readFile(new URL("../app/competition-discovery.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/event-archive.css", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(manifest.version, "14.7.0");
  assert.match(page, /Enterprise 14\.7/);
  assert.match(page, /useState<View>\("competitions"\)/);
  assert.match(source, /events-home-head/);
  assert.match(source, /NEXT ENTRY DEADLINE/);
  assert.match(source, /type Period="Current events"\|"Past events"/);
  assert.match(source, /eventBelongsInCurrent/);
  assert.match(source, /eventIsLive/);
  assert.match(source, /event\.end>=today/);
  assert.match(source, /event\.end<today/);
  assert.match(source, /Europe\/London/);
  assert.match(source, /Current events/);
  assert.match(source, /Live now/);
  assert.match(source, /Registration open/);
  assert.match(source, /Dates to review/);
  assert.match(source, /All years/);
  assert.match(source, /All results/);
  assert.match(source, /planner-filter-toggle/);
  assert.match(source, /clashesByEvent/);
  assert.match(source, /eventsOverlap/);
  assert.match(source, /Next \$\{item\}/);
  assert.match(source, /Last \$\{item\}/);
  assert.match(source, /layout==="Agenda"/);
  assert.match(source, /PHASE 121 · GROUPED IPHONE AGENDA/);
  assert.match(source, /PHASE 122/);
  assert.match(source, /Needs action/);
  assert.match(source, /calendarContent/);
  assert.match(source, /X-WR-CALNAME:FightEye events/);
  assert.match(source, /＋ Calendar/);
  assert.match(source, /primaryDeadline/);
  assert.match(source, /Closing soon/);
  assert.match(source, /directionsUrl/);
  assert.match(source, /maps\.apple\.com/);
  assert.match(source, /PHASES 125–126 · MOBILE EVENT PACK/);
  assert.match(source, /FIGHTEYE CLUB EVENT BRIEF/);
  assert.match(source, /⇩ Club briefing/);
  assert.match(css, /\.timeline-period-tabs/);
  assert.match(css, /\.current-event-filters/);
  assert.match(css, /\.timeline-range-filters/);
  assert.match(css, /\.timeline-clash-alert/);
  assert.match(css, /\.event-agenda/);
  assert.match(css, /\.agenda-group/);
  assert.match(css, /\.timeline-personal-filters/);
  assert.match(css, /\.calendar-pack/);
  assert.match(css, /\.deadline-radar/);
  assert.match(css, /\.timeline-directions/);
  assert.match(css, /overscroll-behavior-x:contain/);
  assert.doesNotMatch(css, /position:(fixed|sticky)/);
});
