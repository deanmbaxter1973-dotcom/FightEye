import unittest
from datetime import date
from weekly_event_refresh import dates_from_html, update

class WeeklyRefreshTests(unittest.TestCase):
    def test_kihapp_range(self):
        self.assertEqual(dates_from_html('<h1>WKO British Open</h1><p>Oct 2 to 4, 2026</p>', 'Kihapp'), ('2026-10-02','2026-10-04'))
        self.assertEqual(dates_from_html('<h1>WKO British Open</h1><p>October 2 to 4, 2026</p>', 'Kihapp'), ('2026-10-02','2026-10-04'))
    def test_failure_preserves_entry(self):
        entry={'id':'x','name':'WKU English Open','source':'Kihapp','sourceUrl':'https://example.org/x','start':'2027-01-30','end':'2027-01-30','closing':'2027-01-25'}
        update([entry], lambda _: (_ for _ in ()).throw(OSError('offline')), date(2026,9,27))
        self.assertEqual(entry['closing'],'2027-01-25')
    def test_changed_date_clears_closing(self):
        entry={'id':'x','name':'WKU English Open','source':'Kihapp','sourceUrl':'https://example.org/x','start':'2027-01-30','end':'2027-01-30','closing':'2027-01-25'}
        checked,changed=update([entry],lambda _:'<h1>WKU English Open</h1><p>February 6, 2027</p>',date(2026,9,27))
        self.assertEqual((checked,changed,entry['start'],entry['closing']),(1,1,'2027-02-06',None))
if __name__=='__main__':unittest.main()
