/// <reference path="../pb_data/types.d.ts" />

// Aggregates news teasers (title, excerpt, cover image, source link) from
// VinFast's official electric-car news page. Full article bodies are NOT
// copied — only a short excerpt plus a link back to the original source,
// so the site links out to VinFastAuto for the full article.
//
// NOTE: PocketBase's JSVM only keeps a routerAdd/cronAdd callback's own
// function body in scope at invocation time — top-level helper functions
// declared elsewhere in this file are NOT visible inside those callbacks.
// So every helper below is intentionally re-declared inside each callback.

// The Chromium-based news-sync container owns scheduled synchronization.
// Keep this implementation available for reference without registering a
// second six-hour job that performs the same work.
if (false) {
    cronAdd("news-sync", "0 */6 * * *", () => {
        function syncNewsFromSource(app) {
            const NEWS_SOURCE_URL = "https://vinfastauto.com/vn_vi/tin-tuc/o-to-dien";
            const NEWS_SOURCE_BASE = "https://vinfastauto.com";
            const VN_CHAR_MAP = {
                "à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a", "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a", "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
                "è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e", "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
                "ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
                "ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o", "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o", "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
                "ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u", "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
                "ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y",
                "đ": "d"
            };

            function slugify(str) {
                let s = String(str).toLowerCase();
                let out = "";
                for (let i = 0; i < s.length; i++) {
                    const ch = s[i];
                    out += VN_CHAR_MAP[ch] !== undefined ? VN_CHAR_MAP[ch] : ch;
                }
                out = out.replace(/&/g, " and ");
                out = out.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                return out.slice(0, 200) || ("tin-" + Math.floor(Math.random() * 1e9));
            }

            function decodeEntities(str) {
                return String(str)
                    .replace(/<[^>]+>/g, "")
                    .replace(/&amp;/g, "&")
                    .replace(/&quot;/g, "\"")
                    .replace(/&#0?39;/g, "'")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/\s+/g, " ")
                    .trim();
            }

            function fetchNewsTeasers() {
                const response = $http.send({
                    url: NEWS_SOURCE_URL,
                    method: "GET",
                    timeout: 30,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                        "Referer": "https://vinfastauto.com/",
                    },
                });

                if (response.statusCode !== 200) {
                    throw new Error("VinFastAuto trả về mã " + response.statusCode);
                }

                const html = Array.isArray(response.body)
                    ? String.fromCharCode.apply(null, response.body)
                    : response.body;

                const re = /<div class="field-image">\s*<a href="([^"]+)"[^>]*><img[^>]*src="([^"]+)"[^>]*>[\s\S]*?<div class="field-title">\s*<a href="[^"]+"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<div class="field-desc">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<time datetime="([^"]+)"/g;

                const items = [];
                let m;
                while ((m = re.exec(html)) !== null) {
                    const link = m[1].indexOf("http") === 0 ? m[1] : NEWS_SOURCE_BASE + m[1];
                    const title = decodeEntities(m[3]);
                    if (!title) continue;
                    items.push({
                        source_url: link,
                        cover_image_url: m[2],
                        title: title,
                        excerpt: decodeEntities(m[4]),
                        published_at: m[5],
                    });
                }
                return items;
            }

            const items = fetchNewsTeasers();
            const collection = app.findCollectionByNameOrId("news");
            let created = 0;
            let skipped = 0;

            items.forEach((item) => {
                try {
                    app.findFirstRecordByFilter("news", "source_url = {:url}", { url: item.source_url });
                    skipped++;
                } catch (e) {
                    const record = new Record(collection);
                    record.set("title", item.title);
                    record.set("slug", slugify(item.title));
                    record.set("excerpt", item.excerpt);
                    record.set("cover_image_url", item.cover_image_url);
                    record.set("source_url", item.source_url);
                    record.set("source_name", "VinFast Auto");
                    record.set("published", true);
                    record.set("published_at", item.published_at);
                    app.save(record);
                    created++;
                }
            });

            return { fetched: items.length, created: created, skipped: skipped };
        }

        try {
            const result = syncNewsFromSource($app);
            $app.logger().info("news-sync completed", "fetched", result.fetched, "created", result.created, "skipped", result.skipped);
        } catch (err) {
            $app.logger().error("news-sync failed", "err", String(err));
        }
    });
}

routerAdd("POST", "/api/custom/news-sync", (e) => {
    function syncNewsFromSource(app) {
        const NEWS_SOURCE_URL = "https://vinfastauto.com/vn_vi/tin-tuc/o-to-dien";
        const NEWS_SOURCE_BASE = "https://vinfastauto.com";
        const VN_CHAR_MAP = {
            "à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a", "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a", "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
            "è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e", "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
            "ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
            "ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o", "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o", "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
            "ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u", "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
            "ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y",
            "đ": "d"
        };

        function slugify(str) {
            let s = String(str).toLowerCase();
            let out = "";
            for (let i = 0; i < s.length; i++) {
                const ch = s[i];
                out += VN_CHAR_MAP[ch] !== undefined ? VN_CHAR_MAP[ch] : ch;
            }
            out = out.replace(/&/g, " and ");
            out = out.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            return out.slice(0, 200) || ("tin-" + Math.floor(Math.random() * 1e9));
        }

        function decodeEntities(str) {
            return String(str)
                .replace(/<[^>]+>/g, "")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, "\"")
                .replace(/&#0?39;/g, "'")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/\s+/g, " ")
                .trim();
        }

        function fetchNewsTeasers() {
            const response = $http.send({
                url: NEWS_SOURCE_URL,
                method: "GET",
                timeout: 30,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Referer": "https://vinfastauto.com/",
                },
            });

            if (response.statusCode !== 200) {
                throw new Error(
                    "VinFastAuto trả về mã " + response.statusCode +
                    " (trang nguồn có thể đang chặn truy cập tự động, hãy thử đồng bộ lại sau)."
                );
            }

            const html = Array.isArray(response.body)
                ? String.fromCharCode.apply(null, response.body)
                : response.body;

            const re = /<div class="field-image">\s*<a href="([^"]+)"[^>]*><img[^>]*src="([^"]+)"[^>]*>[\s\S]*?<div class="field-title">\s*<a href="[^"]+"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<div class="field-desc">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<time datetime="([^"]+)"/g;

            const items = [];
            let m;
            while ((m = re.exec(html)) !== null) {
                const link = m[1].indexOf("http") === 0 ? m[1] : NEWS_SOURCE_BASE + m[1];
                const title = decodeEntities(m[3]);
                if (!title) continue;
                items.push({
                    source_url: link,
                    cover_image_url: m[2],
                    title: title,
                    excerpt: decodeEntities(m[4]),
                    published_at: m[5],
                });
            }
            return items;
        }

        const items = fetchNewsTeasers();
        const collection = app.findCollectionByNameOrId("news");
        let created = 0;
        let skipped = 0;

        items.forEach((item) => {
            try {
                app.findFirstRecordByFilter("news", "source_url = {:url}", { url: item.source_url });
                skipped++;
            } catch (e2) {
                const record = new Record(collection);
                record.set("title", item.title);
                record.set("slug", slugify(item.title));
                record.set("excerpt", item.excerpt);
                record.set("cover_image_url", item.cover_image_url);
                record.set("source_url", item.source_url);
                record.set("source_name", "VinFast Auto");
                record.set("published", true);
                record.set("published_at", item.published_at);
                app.save(record);
                created++;
            }
        });

        return { fetched: items.length, created: created, skipped: skipped };
    }

    try {
        const result = syncNewsFromSource(e.app);
        return e.json(200, result);
    } catch (err) {
        throw new BadRequestError(String(err));
    }
}, $apis.requireSuperuserAuth());

// Used only by the Chromium worker on the private Docker network. nginx
// explicitly blocks this path on the public /hcgi/platform proxy.
routerAdd("POST", "/api/internal/news-ingest", (e) => {
    const item = e.requestInfo().body || {};
    const title = String(item.title || "").trim();
    const sourceUrl = String(item.source_url || "").trim();
    const slug = String(item.slug || "").trim();

    if (!title || title.length > 300) {
        throw new BadRequestError("Invalid title");
    }
    if (!/^https:\/\/(?:www\.)?vinfastauto\.com\//i.test(sourceUrl)) {
        throw new BadRequestError("Invalid source URL");
    }
    if (!/^[a-z0-9-]{1,200}$/.test(slug)) {
        throw new BadRequestError("Invalid slug");
    }

    try {
        e.app.findFirstRecordByFilter("news", "source_url = {:url}", { url: sourceUrl });
        return e.json(200, { created: false, skipped: true });
    } catch (_) {
        const collection = e.app.findCollectionByNameOrId("news");
        const record = new Record(collection);
        record.set("title", title);
        record.set("slug", slug);
        record.set("excerpt", String(item.excerpt || "").slice(0, 1000));
        record.set("cover_image_url", String(item.cover_image_url || ""));
        record.set("source_url", sourceUrl);
        record.set("source_name", "VinFast Auto");
        record.set("published", true);
        record.set("published_at", item.published_at || new Date().toISOString());
        e.app.save(record);
        return e.json(201, { created: true, skipped: false });
    }
});

routerAdd("POST", "/api/internal/slider-ingest", (e) => {
    const slides = (e.requestInfo().body || {}).slides;
    if (!Array.isArray(slides) || !slides.length || slides.length > 20) {
        throw new BadRequestError("Expected 1–20 verified home banners");
    }
    const seen = {};
    slides.forEach((item) => {
        if (!/^https:\/\/vinfastauto\.com\/vn_vi#home-electric-[a-f0-9]{16}$/.test(item.source_url || "") || seen[item.source_url]) {
            throw new BadRequestError("Invalid or duplicate slider source");
        }
        seen[item.source_url] = true;
        [item.image_url, item.mobile_image_url, item.link_url].forEach((url, index) => {
            if (index === 1 && !url) return;
            if (!/^https:\/\/(?:[a-z0-9-]+\.)*vinfastauto\.com\//i.test(url || "")) {
                throw new BadRequestError("Invalid VinFast banner URL");
            }
        });
    });

    const result = { created: 0, updated: 0, skipped: 0, disabled: 0 };
    e.app.runInTransaction((app) => {
        const collection = app.findCollectionByNameOrId("sliders");
        const existing = app.findRecordsByFilter("sliders", "source_url != ''", "", 1000, 0);
        slides.forEach((item, index) => {
            let record = existing.find((entry) => entry.getString("source_url") === item.source_url);
            if (record) {
                // Slide đã được admin sửa từ /admin (managed=false) là "của" quản trị:
                // đồng bộ không được đụng vào, kể cả phần ảnh.
                if (!record.getBool("managed")) {
                    result.skipped++;
                    return;
                }
                // Slide tự động: chỉ làm mới ảnh khi nguồn đổi, không ghi đè
                // tiêu đề, mô tả, link, thứ tự hay trạng thái hiển thị.
                let changed = false;
                if (record.get("image_url") !== item.image_url) {
                    record.set("image_url", item.image_url);
                    changed = true;
                }
                if ((record.get("mobile_image_url") || "") !== (item.mobile_image_url || "")) {
                    record.set("mobile_image_url", item.mobile_image_url || "");
                    changed = true;
                }
                if (changed) {
                    app.save(record);
                    result.updated++;
                } else {
                    result.skipped++;
                }
            } else {
                record = new Record(collection);
                record.set("source_url", item.source_url);
                record.set("image_url", item.image_url);
                record.set("mobile_image_url", item.mobile_image_url || "");
                record.set("title", String(item.title || "Ô tô điện VinFast").slice(0, 200));
                record.set("subtitle", "");
                record.set("link_url", item.link_url);
                record.set("order", index);
                record.set("active", true);
                record.set("managed", true);
                app.save(record);
                result.created++;
            }
        });
        existing.forEach((record) => {
            const source = record.getString("source_url");
            const managed = source.startsWith("https://vinfastauto.com/vn_vi#home-electric-") || source.startsWith("https://vinfastauto.com/vn_vi/o-to-dien#");
            // Chỉ tự ẩn các slide do máy tạo (managed=true) và chưa được admin can thiệp.
            if (managed && record.getBool("managed") && !seen[source] && record.getBool("active")) {
                record.set("active", false);
                app.save(record);
                result.disabled++;
            }
        });
    });
    return e.json(200, result);
});

// Khi admin sửa slide từ /admin, dừng bộ đồng bộ quản lý slide đó để không
// ghi đè nội dung người dùng đã chỉnh sửa.
onRecordUpdateRequest((e) => {
    if (e.record.getBool("managed")) {
        e.record.set("managed", false);
    }
    e.next();
}, "sliders");
