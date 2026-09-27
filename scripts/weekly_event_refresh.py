#!/usr/bin/env python3
"""Recheck dated FightEye listings, preserving data when a source cannot be verified."""
import json
import re
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1] / 'fighteye_v195_v196' / 'data'
MONTHS = {m.lower(): n for n, m in enumerate('January February March April May June July August September October November December'.split(), 1)}
MONTHS.update({m[:3]: n for m, n in list(MONTHS.items())})

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.ignored = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.ignored += 1
        if tag in ('p', 'h1', 'h2', 'div', 'br'): self.parts.append(' ')
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.ignored = max(0, self.ignored - 1)
        if tag in ('p', 'h1', 'h2', 'div'): self.parts.append(' ')
    def handle_data(self, data):
        if not self.ignored: self.parts.append(data)

def dates_from_html(html, source):
    parser = Text(); parser.feed(html)
    visible = re.sub(r'\s+', ' ', ''.join(parser.parts))[:6000]
    if source == 'Kihapp':
        match = re.search(r'\b(' + '|'.join(MONTHS) + r')\s+(\d{1,2})(?:\s+to\s+(?:(\w+)\s+)?(\d{1,2}))?,?\s+(20\d{2})\b', visible, re.I)
        if not match: return None
        month, day, end_month, end_day, year = match.groups()
        start = date(int(year), MONTHS[month.lower()], int(day))
        end = date(int(year), MONTHS[(end_month or month).lower()], int(end_day or day))
        return start.isoformat(), end.isoformat()
    if source.startswith('Sportdata'):
        match = re.search(r'\b(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*[-–]\s*(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})\b', visible)
        if match:
            y,m,d,ey,em,ed = map(int, match.groups())
            return date(y,m,d).isoformat(), date(ey,em,ed).isoformat()
    return None

def fetch(url):
    req = Request(url, headers={'User-Agent':'FightEyeEventCalendar/1.0 (+https://github.com/deanmbaxter1973-dotcom/FightEye)', 'Accept':'text/html'})
    with urlopen(req, timeout=15) as response:
        if response.status != 200: raise ValueError('HTTP '+str(response.status))
        return response.read(1_000_000).decode('utf-8', 'replace')

def update(events, fetcher=fetch, today=None):
    today = today or date.today(); checked = changed = 0
    for event in events:
        source = event.get('source', '')
        if source != 'Kihapp' and not source.startswith('Sportdata'): continue
        url = event.get('sourceUrl', '')
        if not url.startswith('https://'): continue
        try:
            html = fetcher(url)
            parsed = dates_from_html(html, source)
            if not parsed: continue
            start, end = parsed
            if start > end or abs((date.fromisoformat(start)-date.fromisoformat(event['start'])).days) > 90: continue
            # An unrelated page or an index may contain another event's date.
            title = re.sub(r'[^a-z0-9]+', ' ', event['name'].lower()).strip().split()
            visible = re.sub(r'[^a-z0-9]+', ' ', html.lower())
            if len(title) >= 2 and not all(word in visible for word in title[:2]): continue
            checked += 1
            if (start, end) != (event['start'], event['end']):
                event['start'], event['end'] = start, end
                # A changed date invalidates the old registration deadline.
                event['closing'] = None
                changed += 1
            event['verifiedAt'] = today.isoformat()
        except (OSError, ValueError, TimeoutError) as error:
            print(f"Preserved {event['id']}: {error}", file=sys.stderr)
    return checked, changed

def main():
    api = ROOT / 'events-api.json'; events = json.loads(api.read_text())
    checked, changed = update(events)
    if not checked:
        print('No listing could be verified; retaining existing data.')
        return 0
    api.write_text(json.dumps(events, ensure_ascii=False, indent=2)+'\n')
    js = ROOT / 'events.js'; old = js.read_text()
    athletes = old.split('window.FIGHTEYE_ATHLETES = ', 1)[1].strip().rstrip(';')
    js.write_text('window.FIGHTEYE_EVENTS = '+json.dumps(events, ensure_ascii=False, indent=2)+';\nwindow.FIGHTEYE_ATHLETES = '+athletes+';\n')
    print(f'Verified {checked} listings; updated {changed} dates.')
    return 0
if __name__ == '__main__': raise SystemExit(main())
