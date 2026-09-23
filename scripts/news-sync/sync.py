import html
import hashlib
from html.parser import HTMLParser
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.request

NEWS_SOURCE_URL = "https://vinfastauto.com/vn_vi/tin-tuc/o-to-dien"
SLIDER_SOURCE_URL = "https://vinfastauto.com/vn_vi"
PB_URL = os.environ.get("PB_URL", "http://pocketbase:8090")

ITEM_RE = re.compile(
    r'<div class="field-image">\s*<a href="([^"]+)"[^>]*><img[^>]*src="([^"]+)"[^>]*>'
    r'[\s\S]*?<div class="field-title">\s*<a href="[^"]+"[^>]*>([\s\S]*?)</a>'
    r'[\s\S]*?<div class="field-desc">\s*([\s\S]*?)\s*</div>[\s\S]*?<time datetime="([^"]+)"'
)


def decode(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def slugify(s):
    original = s
    s = s.lower()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("đ", "d")
    s = re.sub(r"&", " and ", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    s = s[:200]
    if not s:
        s = "tin-" + hashlib.sha256(str(original).encode("utf-8")).hexdigest()[:12]
    return s


def fetch_rendered_html(url, virtual_time_budget_ms):
    result = subprocess.run(
        [
            "chromium-browser",
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            f"--user-data-dir=/tmp/chromium-{os.getpid()}",
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "--dump-dom",
            f"--virtual-time-budget={virtual_time_budget_ms}",
            url,
        ],
        capture_output=True,
        timeout=90,
        check=True,
    )
    return result.stdout.decode("utf-8", errors="replace")


def parse_items(html_content):
    items = []
    for m in ITEM_RE.finditer(html_content):
        link, img, title, desc, dt = m.groups()
        if not link.startswith("http"):
            link = "https://vinfastauto.com" + link
        title = decode(title)
        if not title:
            continue
        items.append(
            {
                "source_url": link,
                "cover_image_url": img,
                "title": title,
                "excerpt": decode(desc),
                "published_at": dt,
            }
        )
    return items


def absolute_url(value):
    value = html.unescape(value).strip()
    if value.startswith("//"):
        return "https:" + value
    if value.startswith("/"):
        return "https://vinfastauto.com" + value
    return value


class HomeBannerParser(HTMLParser):
    """Read only real home hero slides, excluding comments and Swiper clones."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.banner_depth = None
        self.slide_depth = None
        self.current = None
        self.slides = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "div":
            self.depth += 1
            classes = attrs.get("class", "").split()
            if attrs.get("id") == "block-home-banner":
                self.banner_depth = self.depth
            if self.banner_depth and "swiper-slide" in classes and "swiper-slide-duplicate" not in classes:
                self.slide_depth = self.depth
                self.current = {}
        if self.current is None:
            return
        if tag == "a":
            self.current["link_url"] = absolute_url(attrs.get("href", ""))
        elif tag == "source" and "max-width" in attrs.get("media", ""):
            self.current["mobile_image_url"] = absolute_url(attrs.get("srcset", "").split(",")[0].split(" ")[0])
        elif tag == "img":
            self.current["image_url"] = absolute_url(attrs.get("data-src") or attrs.get("src", ""))
            self.current["title"] = attrs.get("alt", "")

    def handle_endtag(self, tag):
        if tag != "div":
            return
        if self.current is not None and self.depth == self.slide_depth:
            self.slides.append(self.current)
            self.current = None
            self.slide_depth = None
        if self.depth == self.banner_depth:
            self.banner_depth = None
        self.depth -= 1


def parse_slider_items(html_content):
    parser = HomeBannerParser()
    parser.feed(html_content)
    items, seen = [], set()
    for slide in parser.slides:
        image_url = slide.get("image_url", "")
        if not re.match(r"^https://(?:[^/]+\.)?vinfastauto\.com/", image_url, re.I) or image_url in seen:
            continue
        # Some car banners have a copied motorcycle alt attribute on the source.
        # Classify by their own image filename and link, never adjacent menu text.
        evidence = slugify(image_url.rsplit("/", 1)[-1]) + "-" + slugify(slide.get("link_url", ""))
        if re.search(r"xe-may|motorcycle|scooter|evo-|feliz|klara|vento|theon|drgnfly", evidence):
            continue
        model = re.search(r"vf-?([2-9])|(?:minio|herio|nerio|limo)-green|vf-?mpv-?7|ec-van", evidence)
        if not model and not re.search(r"o-to|banner-oto|products-car", evidence):
            continue
        if model:
            label = "VF " + model.group(1) if model.group(1) else model.group().replace("-", " ").title()
            slide["title"] = "Ô tô điện VinFast " + label
        slide["mobile_image_url"] = re.sub(r"(\.webp)\1$", r"\1", slide.get("mobile_image_url", ""))
        slide["source_url"] = SLIDER_SOURCE_URL + "#home-electric-" + hashlib.sha256(image_url.encode()).hexdigest()[:16]
        slide["order"] = len(items)
        seen.add(image_url)
        items.append(slide)
    return items


def pb_create_news(item):
    body = json.dumps(
        {
            "title": item["title"],
            "slug": slugify(item["title"]),
            "excerpt": item["excerpt"],
            "cover_image_url": item["cover_image_url"],
            "source_url": item["source_url"],
            "source_name": "VinFast Auto",
            "published": True,
            "published_at": item["published_at"],
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{PB_URL}/api/internal/news-ingest",
        data=body,
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def pb_upsert_sliders(items):
    body = json.dumps({"slides": items}).encode("utf-8")
    req = urllib.request.Request(
        f"{PB_URL}/api/internal/slider-ingest",
        data=body,
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def sync_sliders():
    html_content = fetch_rendered_html(SLIDER_SOURCE_URL, 35000)
    items = parse_slider_items(html_content)
    if not items:
        raise RuntimeError("Không tìm thấy hình ô tô điện từ VinFastAuto")
    result = pb_upsert_sliders(items)
    return len(items), result.get("created", 0), result.get("updated", 0)


def main():
    # The source page is a heavy client-rendered SPA that sometimes still shows
    # its loading splash when the virtual time budget runs out, so retry with a
    # longer budget before giving up.
    items = []
    for attempt, budget_ms in enumerate((15000, 25000, 35000), start=1):
        try:
            html_content = fetch_rendered_html(NEWS_SOURCE_URL, budget_ms)
            items = parse_items(html_content)
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, OSError) as exc:
            print(f"Attempt {attempt}: source fetch failed ({type(exc).__name__})", file=sys.stderr)
            items = []
        if items:
            break
        print(f"Attempt {attempt} (budget={budget_ms}ms) parsed 0 items, retrying...", file=sys.stderr)
        if attempt < 3:
            time.sleep(5)

    if not items:
        print("No items parsed after retries — source page structure may have changed.", file=sys.stderr)
        sys.exit(1)

    created, skipped, failed = 0, 0, 0
    for item in items:
        try:
            result = pb_create_news(item)
            if result.get("created"):
                created += 1
            else:
                skipped += 1
        except urllib.error.HTTPError as e:
            err = e.read().decode(errors="replace")
            if "idx_news_source_url" in err or "already exists" in err.lower() or "validation_not_unique" in err:
                skipped += 1
            else:
                failed += 1
                print(f"ERROR creating '{item['title'][:60]}': {err[:200]}", file=sys.stderr)
        except (urllib.error.URLError, TimeoutError, ValueError) as exc:
            failed += 1
            print(f"ERROR importing article: {type(exc).__name__}", file=sys.stderr)

    print(f"fetched={len(items)} created={created} skipped={skipped} failed={failed}")
    if failed:
        sys.exit(1)

    try:
        slider_fetched, slider_created, slider_updated = sync_sliders()
        print(
            f"sliders_fetched={slider_fetched} sliders_created={slider_created} "
            f"sliders_updated={slider_updated}"
        )
    except (RuntimeError, subprocess.CalledProcessError, subprocess.TimeoutExpired, OSError, ValueError) as exc:
        print(f"Slider sync skipped: {exc}", file=sys.stderr)


if __name__ == "__main__":
    main()
