// Read a public Sportdata results page supplied by the coach. Never proxy arbitrary URLs.
const clean = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
const normalise = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\b(martial arts|martial art)\b/g, 'martial art');
function candidates(html, club) {
  const target = normalise(club), matches = new Map();
  if (target.length < 4) return [];
  for (const row of String(html).match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || []) {
    const cells = [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => clean(m[1]));
    const clubIndex = cells.findIndex(cell => normalise(cell) === target || (target.endsWith('s') && normalise(cell) === target.slice(0, -1)));
    if (clubIndex < 1) continue;
    const name = cells[clubIndex - 1].replace(/\s+/g, ' ').trim();
    if (!/^[\p{L}][\p{L}'’ .-]{2,79}$/u.test(name) || /^(name|competitor|athlete)$/i.test(name)) continue;
    const parts = name.split(' ');
    const display = parts.length === 2 && name === name.toUpperCase() ? `${parts[1]} ${parts[0]}`.toLowerCase().replace(/\b\p{L}/gu, letter => letter.toUpperCase()) : name;
    matches.set(normalise(name), display);
  }
  return [...matches.values()].slice(0, 150).sort((a, b) => a.localeCompare(b));
}
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return {statusCode: 405, body: 'Method not allowed'};
  try {
    const {url, club} = JSON.parse(event.body || '{}');
    const source = new URL(url);
    if (source.protocol !== 'https:' || source.hostname !== 'www.sportdata.org' || !source.pathname.startsWith('/kickboxing/set-online/popup_main.php') || source.searchParams.get('popup_action') !== 'results' || !/^\d{1,7}$/.test(source.searchParams.get('vernr') || '') || source.username || source.password) throw Error('Use a public Sportdata kickboxing event results link.');
    if (typeof club !== 'string' || club.length < 4 || club.length > 80) throw Error('Enter a club name.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let response;
    try { response = await fetch(source.toString(), {signal: controller.signal, redirect: 'error', headers: {'Accept': 'text/html'}}); } finally { clearTimeout(timer); }
    if (!response.ok || !(response.headers.get('content-type') || '').includes('text/html')) throw Error('This results page could not be read.');
    const length = Number(response.headers.get('content-length') || 0);
    if (length > 2_000_000) throw Error('Results page is too large.');
    const html = await response.text();
    if (html.length > 2_000_000) throw Error('Results page is too large.');
    return {statusCode: 200, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}, body: JSON.stringify({names: candidates(html, club), source: source.toString()})};
  } catch (error) { return {statusCode: 400, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({error: error.message || 'Could not read results.'})}; }
};
exports.candidates = candidates;
