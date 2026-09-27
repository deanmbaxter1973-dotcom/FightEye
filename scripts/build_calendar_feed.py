#!/usr/bin/env python3
"""Build a public, read-only iCalendar subscription from the verified catalogue."""
import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/'fighteye_v195_v196'/'data'

def escape(value):
    return str(value or '').replace('\\','\\\\').replace('\n','\\n').replace(',','\\,').replace(';','\\;')

def fold(line):
    # RFC 5545 content lines are at most 75 octets, counting continuation space.
    chunks=[]; current=''; size=0
    for char in line:
        octets=len(char.encode('utf-8'))
        if size+octets>75:
            chunks.append(current);current=' ';size=1
        current+=char;size+=octets
    chunks.append(current)
    return '\r\n'.join(chunks)

def build(events, stamp=None):
    stamp=stamp or datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FightEye//UK Competition Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:FightEye Events','X-WR-CALDESC:FightEye competition and training dates. Check organiser links for changes.','REFRESH-INTERVAL;VALUE=DURATION:P1D','X-PUBLISHED-TTL:PT24H']
    for e in events:
        if not e.get('id') or not e.get('start') or not e.get('end'):continue
        start=date.fromisoformat(e['start']); end=date.fromisoformat(e['end'])+timedelta(days=1)
        url=e.get('sourceUrl','')
        details=' • '.join(str(x) for x in [e.get('org'),e.get('rule'),e.get('notes'),url] if x)
        lines.extend(['BEGIN:VEVENT',f"UID:{escape(e['id'])}@fighteye.app",f'DTSTAMP:{stamp}',f"DTSTART;VALUE=DATE:{start:%Y%m%d}",f"DTEND;VALUE=DATE:{end:%Y%m%d}",f"SUMMARY:{escape(e['name'])}",f"LOCATION:{escape(', '.join(str(x) for x in [e.get('venue'),e.get('city'),e.get('country')] if x))}",f'DESCRIPTION:{escape(details)}'])
        if url.startswith('https://'):lines.append('URL:'+url)
        lines.append('END:VEVENT')
    lines.append('END:VCALENDAR')
    return '\r\n'.join(fold(line) for line in lines)+'\r\n'

if __name__=='__main__':
    events=json.loads((ROOT/'events-api.json').read_text())
    stamp=max((e.get('verifiedAt','2026-09-27') for e in events),default='2026-09-27').replace('-','')+'T000000Z'
    (ROOT/'events.ics').write_bytes(build(events,stamp).encode('utf-8'))
    print(f'Built subscription with {len(events)} events')
