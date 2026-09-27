import unittest
from build_calendar_feed import build

class CalendarFeedTests(unittest.TestCase):
    def test_all_day_multiday_and_escaping(self):
        event={'id':'test','name':'Open, Finals','start':'2027-07-10','end':'2027-07-11','venue':'Arena','city':'Leeds','country':'United Kingdom','sourceUrl':'https://example.org'}
        feed=build([event], '20260927T120000Z')
        self.assertIn('DTSTART;VALUE=DATE:20270710',feed)
        self.assertIn('DTEND;VALUE=DATE:20270712',feed)
        self.assertIn('SUMMARY:Open\\, Finals',feed)
        self.assertIn('UID:test@fighteye.app',feed)
        self.assertTrue(feed.endswith('END:VCALENDAR\r\n'))
if __name__=='__main__':unittest.main()
