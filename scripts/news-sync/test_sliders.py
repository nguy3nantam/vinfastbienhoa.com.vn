import unittest
from unittest.mock import patch

import sync

CDN = 'https://static-cms-prod.vinfastauto.com/'


def slide(filename, link='https://go.vinfastauto.com/q/test', alt='Ô tô điện', extra_class=''):
    return f'''<div class="swiper-slide slide-item {extra_class}"><a href="{link}">
      <div><picture><source media="(max-width: 767px)" srcset="{CDN}{filename.replace('desktop', 'mobile')}">
      <img src="{CDN}{filename}" alt="{alt}"></picture></div></a></div>'''


def banner(content):
    return '<div id="block-home-banner"><div class="swiper-wrapper">' + content + '</div></div>'


def v3_slide(filename, link='https://go.vinfastauto.com/q/test', alt='Ô tô điện', duplicate=False):
    classes = 'homepage-v3__hero-slide swiper-slide' + (' swiper-slide-duplicate' if duplicate else '')
    return f'''<article class="{classes}" role="group">
      <a href="{link}" class="homepage-v3__hero-link">
        <div class="homepage-v3__hero-media"><picture class="homepage-v3__hero-picture">
          <source media="(max-width: 1023px)" srcset="{CDN}{filename.replace('desktop', 'mobile')}">
          <img src="{CDN}{filename}" alt="{alt}" class="homepage-v3__hero-image">
        </picture></div>
      </a></article>'''


def v3_section(content):
    return '<section class="homepage-v3__section homepage-v3__hero">' + content + '</section>'


class SliderTests(unittest.TestCase):
    def test_only_home_banners_not_menu_or_vehicle_catalog(self):
        document = '<nav>' + slide('vf7-menu.webp') + '</nav>'
        document += banner(slide('dat-coc-vf2-desktop.webp'))
        document += '<div id="block-slide-cars">' + slide('vf9.webp') + '</div>'
        items = sync.parse_slider_items(document)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['image_url'], CDN + 'dat-coc-vf2-desktop.webp')
        self.assertEqual(items[0]['mobile_image_url'], CDN + 'dat-coc-vf2-mobile.webp')

    def test_motorcycles_and_ambiguous_banners_are_excluded(self):
        document = banner(slide('xe-may-dien-desktop.webp') + slide('comingsoon-desktop.webp') + slide('vf6-desktop.webp'))
        self.assertEqual(len(sync.parse_slider_items(document)), 1)

    def test_wrong_motorcycle_alt_does_not_hide_car_banner(self):
        items = sync.parse_slider_items(banner(slide('vf2-desktop.webp', alt='xe-may-dien')))
        self.assertEqual(items[0]['title'], 'Ô tô điện VinFast VF 2')

    def test_commented_and_duplicate_slides_are_ignored_and_order_preserved(self):
        vf2 = slide('vf2-desktop.webp')
        document = banner(slide('vf6-desktop.webp', extra_class='swiper-slide-duplicate') + vf2 + '<!--' + slide('vf8-desktop.webp') + '-->' + vf2 + slide('vf6-desktop.webp'))
        items = sync.parse_slider_items(document)
        self.assertEqual([item['order'] for item in items], [0, 1])
        self.assertIn('vf2-desktop', items[0]['image_url'])
        self.assertIn('vf6-desktop', items[1]['image_url'])

    def test_source_identity_is_stable_when_reordered(self):
        vf2, vf6 = slide('vf2-desktop.webp'), slide('vf6-desktop.webp')
        before = sync.parse_slider_items(banner(vf2 + vf6))
        after = sync.parse_slider_items(banner(vf6 + vf2))
        self.assertEqual(before[0]['source_url'], after[1]['source_url'])

    def test_car_voucher_is_included_by_its_own_link(self):
        items = sync.parse_slider_items(banner(slide('vinfast-len-doi-xe-dien-voucher-80-trieu-desktop.jpg', link='https://vinfastauto.com/vn_vi/vinfast-tang-voucher-len-toi-80-trieu-dong-de-khach-hang-cu-chuyen-doi-sang-xe-dien?utm_source=banner_Oto_website')))
        self.assertEqual(len(items), 1)

    def test_empty_source_never_clears_live_sliders(self):
        with patch.object(sync, 'fetch_rendered_html', return_value='<html></html>'), patch.object(sync, 'pb_upsert_sliders') as write:
            with self.assertRaises(RuntimeError):
                sync.sync_sliders()
            write.assert_not_called()

    def test_batch_keeps_source_order_and_normalizes_broken_mobile_extension(self):
        document = banner(slide('limo-green-desktop.webp.webp') + slide('vf6-desktop.webp'))
        with patch.object(sync, 'fetch_rendered_html', return_value=document), patch.object(sync, 'pb_upsert_sliders', return_value={'created': 2}) as write:
            self.assertEqual(sync.sync_sliders(), (2, 2, 0))
            self.assertEqual(write.call_args.args[0][0]['mobile_image_url'], CDN + 'limo-green-mobile.webp')

    def test_v3_homepage_hero_markup_is_supported(self):
        document = v3_section(
            v3_slide('hinh-anh-banner-lai-thu-2010-desktop-v2.webp', alt='Trải nghiệm ô tô điện VinFast')
            + v3_slide('hinh-anh-banner-vf-wild-desktop.webp', alt='VF Wild')
            + v3_slide('hinh-anh-banner-xe-may-dien-desktop.webp', alt='Tương lai xanh xe máy điện')
            + v3_slide('hinh-anh-banner-vinfast-sota-desktop.webp', alt='VF EStore')
            + v3_slide('hinh-anh-banner-lai-thu-2010-desktop-v2.webp', alt='Trải nghiệm ô tô điện VinFast', duplicate=True)
        )
        items = sync.parse_slider_items(document)
        self.assertEqual([item['order'] for item in items], [0, 1])
        self.assertTrue(items[0]['image_url'].endswith('hinh-anh-banner-lai-thu-2010-desktop-v2.webp'))
        self.assertEqual(items[0]['mobile_image_url'], CDN + 'hinh-anh-banner-lai-thu-2010-mobile-v2.webp')
        self.assertEqual(items[0]['title'], 'Trải nghiệm ô tô điện VinFast')
        self.assertTrue(items[1]['image_url'].endswith('hinh-anh-banner-vf-wild-desktop.webp'))

    def test_v3_slide_identity_is_unique_per_image(self):
        document = v3_section(
            v3_slide('hinh-anh-banner-vf-wild-desktop.webp', alt='VF Wild')
            + v3_slide('hinh-anh-banner-vi-tuong-lai-xanh-desktop.webp', alt='Vi tương lai xanh')
        )
        items = sync.parse_slider_items(document)
        self.assertEqual(len(items), 2)
        self.assertNotEqual(items[0]['source_url'], items[1]['source_url'])
        self.assertTrue(all(item['source_url'].startswith(sync.SLIDER_SOURCE_URL + '#home-electric-') for item in items))


if __name__ == '__main__':
    unittest.main()
