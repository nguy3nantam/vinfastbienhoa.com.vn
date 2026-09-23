/// <reference path="../pb_data/types.d.ts" />

// Thay field google_tag_id (chỉ nhận 1 mã đo lường, tự sinh script gtag.js)
// bằng 2 field cho phép dán nguyên đoạn mã do Google Tag Manager cung cấp:
// một đoạn chèn vào <head>, một đoạn chèn ngay sau thẻ mở <body> — đúng theo
// hướng dẫn cài đặt chính thức của GTM, hỗ trợ mọi loại tag (GTM, gtag.js,
// Facebook Pixel...) chứ không chỉ riêng mã G-/AW-xxx.
migrate((app) => {
    const settings = app.findCollectionByNameOrId("site_settings")
    settings.fields.removeByName("google_tag_id")
    settings.fields.add(new Field({
        "name": "google_tag_head",
        "type": "text",
        "required": false,
        "max": 8000
    }))
    settings.fields.add(new Field({
        "name": "google_tag_body",
        "type": "text",
        "required": false,
        "max": 4000
    }))
    app.save(settings)
}, (app) => {
    const settings = app.findCollectionByNameOrId("site_settings")
    settings.fields.removeByName("google_tag_head")
    settings.fields.removeByName("google_tag_body")
    settings.fields.add(new Field({
        "name": "google_tag_id",
        "type": "text",
        "required": false,
        "max": 20
    }))
    app.save(settings)
})
