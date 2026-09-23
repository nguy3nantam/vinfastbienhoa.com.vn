/// <reference path="../pb_data/types.d.ts" />

// Dynamic sitemap.xml — served through nginx at the real /sitemap.xml path
// (see nginx.conf), built live from the vehicles and news collections so it
// never goes stale like a hand-written static file would.

routerAdd("GET", "/api/custom/sitemap.xml", (e) => {
    const SITE_URL = "https://vinfastbienhoa.com.vn";

    function urlEntry(loc, lastmod, changefreq, priority) {
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    }

    function isoDate(v) {
        if (!v) return new Date().toISOString().slice(0, 10);
        return String(v).slice(0, 10);
    }

    const entries = [];
    entries.push(urlEntry(`${SITE_URL}/`, isoDate(), "daily", "1.0"));
    entries.push(urlEntry(`${SITE_URL}/gioi-thieu`, isoDate(), "monthly", "0.7"));
    entries.push(urlEntry(`${SITE_URL}/lien-he`, isoDate(), "monthly", "0.7"));
    entries.push(urlEntry(`${SITE_URL}/tin-tuc`, isoDate(), "daily", "0.8"));

    try {
        const vehicles = e.app.findRecordsByFilter("vehicles", "active = true", "-order", 500, 0);
        vehicles.forEach((v) => {
            entries.push(
                urlEntry(`${SITE_URL}/xe/${v.get("slug")}`, isoDate(v.get("updated")), "weekly", "0.9")
            );
        });
    } catch (err) {
        // vehicles collection unavailable — skip silently, static pages still ship
    }

    try {
        const news = e.app.findRecordsByFilter("news", "published = true", "-published_at", 500, 0);
        news.forEach((n) => {
            entries.push(
                urlEntry(
                    `${SITE_URL}/tin-tuc/${n.get("id")}`,
                    isoDate(n.get("updated") || n.get("published_at")),
                    "monthly",
                    "0.6"
                )
            );
        });
    } catch (err) {
        // news collection unavailable — skip silently
    }

    const xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        entries.join("\n") +
        "\n</urlset>\n";

    return e.blob(200, "application/xml; charset=utf-8", xml);
})
