/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const news = new Collection({
        "name": "news",
        "type": "base",
        "listRule": "published = true",
        "viewRule": "published = true",
        "createRule": null,
        "updateRule": null,
        "deleteRule": null,
        "fields": [
            {
                "name": "title",
                "type": "text",
                "required": true,
                "max": 300
            },
            {
                "name": "slug",
                "type": "text",
                "required": false,
                "max": 300
            },
            {
                "name": "excerpt",
                "type": "text",
                "required": false,
                "max": 1000
            },
            {
                "name": "content",
                "type": "editor",
                "required": false
            },
            {
                "name": "cover_image",
                "type": "file",
                "required": false,
                "maxSelect": 1,
                "maxSize": 8388608,
                "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"]
            },
            {
                "name": "cover_image_url",
                "type": "url",
                "required": false
            },
            {
                "name": "source_url",
                "type": "url",
                "required": false
            },
            {
                "name": "source_name",
                "type": "text",
                "required": false,
                "max": 120
            },
            {
                "name": "published",
                "type": "bool",
                "required": false
            },
            {
                "name": "published_at",
                "type": "date",
                "required": false
            },
            {
                "name": "created",
                "type": "autodate",
                "onCreate": true,
                "onUpdate": false
            },
            {
                "name": "updated",
                "type": "autodate",
                "onCreate": true,
                "onUpdate": true
            }
        ],
        "indexes": [
            "CREATE UNIQUE INDEX `idx_news_source_url` ON `news` (`source_url`) WHERE `source_url` != ''"
        ]
    })
    app.save(news)

    const settings = new Collection({
        "name": "site_settings",
        "type": "base",
        "listRule": "",
        "viewRule": "",
        "createRule": null,
        "updateRule": null,
        "deleteRule": null,
        "fields": [
            {
                "name": "logo",
                "type": "file",
                "required": false,
                "maxSelect": 1,
                "maxSize": 4194304,
                "mimeTypes": ["image/jpeg", "image/png", "image/svg+xml", "image/webp"]
            },
            {
                "name": "favicon",
                "type": "file",
                "required": false,
                "maxSelect": 1,
                "maxSize": 1048576,
                "mimeTypes": ["image/x-icon", "image/png", "image/svg+xml", "image/vnd.microsoft.icon"]
            },
            {
                "name": "hotline_kd",
                "type": "text",
                "required": false,
                "max": 40
            },
            {
                "name": "hotline_dv",
                "type": "text",
                "required": false,
                "max": 40
            },
            {
                "name": "hotline",
                "type": "text",
                "required": false,
                "max": 40
            },
            {
                "name": "zalo",
                "type": "url",
                "required": false
            },
            {
                "name": "messenger",
                "type": "url",
                "required": false
            },
            {
                "name": "fanpage",
                "type": "url",
                "required": false
            },
            {
                "name": "tiktok",
                "type": "url",
                "required": false
            },
            {
                "name": "youtube",
                "type": "url",
                "required": false
            },
            {
                "name": "email",
                "type": "email",
                "required": false
            },
            {
                "name": "address",
                "type": "text",
                "required": false,
                "max": 300
            },
            {
                "name": "mst",
                "type": "text",
                "required": false,
                "max": 40
            },
            {
                "name": "created",
                "type": "autodate",
                "onCreate": true,
                "onUpdate": false
            },
            {
                "name": "updated",
                "type": "autodate",
                "onCreate": true,
                "onUpdate": true
            }
        ]
    })
    app.save(settings)

    const record = new Record(settings)
    record.set("hotline_kd", "0913 75 75 79")
    record.set("hotline_dv", "0917 300 008")
    record.set("hotline", "0913 75 75 79")
    record.set("zalo", "https://zalo.me/0938091340")
    record.set("messenger", "https://m.me/789590844509175")
    record.set("fanpage", "https://m.me/789590844509175")
    record.set("tiktok", "")
    record.set("youtube", "")
    record.set("email", "info@vinfastbienhoa.vn")
    record.set("address", "643 Quốc Lộ 1, Khu Phố 27, Phường Long Bình, TP.Đồng Nai")
    record.set("mst", "3603191328")
    app.save(record)
}, (app) => {
    try {
        app.delete(app.findCollectionByNameOrId("news"))
    } catch (error) {
        if (!error.message.includes("no rows in result set")) throw error
    }
    try {
        app.delete(app.findCollectionByNameOrId("site_settings"))
    } catch (error) {
        if (!error.message.includes("no rows in result set")) throw error
    }
})
