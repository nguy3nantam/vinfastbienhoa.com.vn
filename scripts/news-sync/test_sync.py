import subprocess
import unittest
from unittest.mock import patch

import sync


class SyncTests(unittest.TestCase):
    def setUp(self):
        slider_sync = patch.object(sync, 'sync_sliders', return_value=(1, 0, 1))
        self.sync_sliders = slider_sync.start()
        self.addCleanup(slider_sync.stop)

    def test_timeout_retries_and_recovers(self):
        with patch.object(sync, 'fetch_rendered_html', side_effect=[subprocess.TimeoutExpired('chromium', 90), 'html']) as fetch, \
                patch.object(sync, 'parse_items', return_value=[{'title': 'Test'}]), \
                patch.object(sync, 'pb_create_news', return_value={'created': True}), \
                patch.object(sync.time, 'sleep'):
            sync.main()
            self.assertEqual(fetch.call_count, 2)
            self.sync_sliders.assert_called_once()

    def test_exhausted_timeouts_fail(self):
        with patch.object(sync, 'fetch_rendered_html', side_effect=subprocess.TimeoutExpired('chromium', 90)) as fetch, \
                patch.object(sync.time, 'sleep'), self.assertRaises(SystemExit) as result:
            sync.main()
        self.assertEqual(result.exception.code, 1)
        self.assertEqual(fetch.call_count, 3)

    def test_slider_failure_does_not_lose_successful_news_import(self):
        self.sync_sliders.side_effect = RuntimeError('No sliders')
        with patch.object(sync, 'fetch_rendered_html', return_value='html'), \
                patch.object(sync, 'parse_items', return_value=[{'title': 'Test'}]), \
                patch.object(sync, 'pb_create_news', return_value={'created': True}):
            sync.main()
        self.sync_sliders.assert_called_once()

    def test_import_failure_is_not_success(self):
        with patch.object(sync, 'fetch_rendered_html', return_value='html'), \
                patch.object(sync, 'parse_items', return_value=[{'title': 'Test'}]), \
                patch.object(sync, 'pb_create_news', side_effect=TimeoutError), \
                self.assertRaises(SystemExit) as result:
            sync.main()
        self.assertEqual(result.exception.code, 1)


if __name__ == '__main__':
    unittest.main()
