// Bounded discovery from public Sportdata event entries and results; no arbitrary URL proxy.
const clean = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|#160);/gi, ' ').replace(/&amp;/gi, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/\s+/g, ' ').trim();
const normalise = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\bmartial arts\b/g, 'martial art');
function candidates(html, club, source = '') {
  const target = normalise(club), matches = new Map();
  if (target.length < 4) return [];
  for (const row of String(html).match(/<tr\b[^>]*>[\s\S]*?<\/tr\s*>/gi) || []) {
    const cells = [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]\s*>/gi)].map(m => clean(m[1]));
    const clubIndex = cells.findIndex(cell => normalise(cell) === target);
    if (clubIndex < 1) continue;
    // Ranking pages split surname and forename into separate columns.
    const ranking = /ranking_event_results\.php/i.test(source);
    const name = ranking && clubIndex >= 2 ? `${cells[clubIndex - 2]} ${cells[clubIndex - 1]}`.trim() : cells[clubIndex - 1].trim();
    if (!/^[\p{L}][\p{L}'’ .-]{2,79}$/u.test(name) || /^(name|competitor|athlete)$/i.test(name)) continue;
    const parts = name.split(' ');
    const display = parts.length === 2 && name === name.toUpperCase() ? `${parts[1]} ${parts[0]}`.toLowerCase().replace(/\b\p{L}/gu, letter => letter.toUpperCase()) : name;
    matches.set(normalise(display), display);
  }
  return [...matches.values()].slice(0, 150).sort((a, b) => a.localeCompare(b));
}
function sourceUrl(id, kind) {
  const query = new URLSearchParams({active_menu:'calendar',vernr:id});
  if (kind === 'results') return `https://www.sportdata.org/kickboxing/set-online/popup_main.php?${query}&popup_action=results`;
  return `https://www.sportdata.org/kickboxing/set-online/veranstaltung_info_main.php?${query}&ver_info_action=catauslist`;
}
const RANKING_SOURCES = [135, 140].map(id => `https://setopen.sportdata.org/wakoranking/ranking_event_results.php?eventid=${id}`);
async function readSource(url) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 5500);
  try {
    const response = await fetch(url, {signal:controller.signal, redirect:'error', headers:{Accept:'text/html'}});
    if (!response.ok || !(response.headers.get('content-type') || '').includes('text/html') || Number(response.headers.get('content-length') || 0) > 2_000_000) throw Error('Source unavailable');
    const html = await response.text();
    if (html.length > 2_000_000) throw Error('Source too large');
    return html;
  } finally { clearTimeout(timer); }
}
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return {statusCode:405, body:'Method not allowed'};
  try {
    const {club, eventIds} = JSON.parse(event.body || '{}');
    if (typeof club !== 'string' || club.length < 4 || club.length > 80 || normalise(club).length < 4) throw Error('Enter a club name.');
    if (!Array.isArray(eventIds) || !eventIds.length || eventIds.length > 8 || eventIds.some(id => typeof id !== 'string' || !/^\d{1,7}$/.test(id))) throw Error('No supported public events to check.');
    const ids = [...new Set(eventIds)].slice(0, 8), sources = [...ids.flatMap(id => ['entries','results'].map(kind => sourceUrl(id, kind))), ...RANKING_SOURCES];
    const hits = new Map(); let checked = 0;
    // One bounded batch keeps the function within hosting time limits.
    const batch = await Promise.all(sources.map(async url => {
      try { return {url, names:candidates(await readSource(url), club, url)}; } catch { return null; }
    }));
    for (const item of batch) if (item) { checked++; for (const name of item.names) {
      const key = normalise(name), hit = hits.get(key) || {name, sources:[]};
      hit.sources.push(item.url); hits.set(key, hit);
    }}
    if (!checked) throw Error('Public event pages could not be read. Try refreshing later.');
    return {statusCode:200, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}, body:JSON.stringify({candidates:[...hits.values()].slice(0, 150).sort((a,b) => a.name.localeCompare(b.name)), checked, total:sources.length, checkedAt:new Date().toISOString()})};
  } catch (error) { return {statusCode:400, headers:{'Content-Type':'application/json'}, body:JSON.stringify({error:error.message || 'Could not search public events.'})}; }
};
exports.candidates = candidates;
exports.sourceUrl = sourceUrl;
