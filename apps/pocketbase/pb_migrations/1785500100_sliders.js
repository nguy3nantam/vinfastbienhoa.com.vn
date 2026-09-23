/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const sliders = new Collection({
        "name": "sliders",
        "type": "base",
        "listRule": "active = true",
        "viewRule": "active = true",
        "createRule": null,
        "updateRule": null,
        "deleteRule": null,
        "fields": [
            {
                "name": "title",
                "type": "text",
                "required": false,
                "max": 200
            },
            {
                "name": "subtitle",
                "type": "text",
                "required": false,
                "max": 300
            },
            {
                "name": "image",
                "type": "file",
                "required": false,
                "maxSelect": 1,
                "maxSize": 10485760,
                "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"]
            },
            {
                "name": "image_url",
                "type": "url",
                "required": false
            },
            {
                "name": "link_url",
                "type": "url",
                "required": false
            },
            {
                "name": "source_url",
                "type": "url",
                "required": false
            },
            {
                "name": "order",
                "type": "number",
                "required": false
            },
            {
                "name": "active",
                "type": "bool",
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
        ]
    })
    app.save(sliders)

    const seed = [
        "https://horizons-cdn.hostinger.com/4ad5f4ca-e1d7-486a-95e2-1d30485eb2a1/3e72fc005c795313827c03a80a0d427a.webp",
        "https://horizons-cdn.hostinger.com/4ad5f4ca-e1d7-486a-95e2-1d30485eb2a1/662f23294fb3a464919fd51fdccb23a7.jpg",
        "https://horizons-cdn.hostinger.com/4ad5f4ca-e1d7-486a-95e2-1d30485eb2a1/3803defc689964310a59aedf22a5f9d7.webp",
        "https://horizons-cdn.hostinger.com/4ad5f4ca-e1d7-486a-95e2-1d30485eb2a1/a683b3d23dc6faecf72405e3b231377e.webp",
    ]
    seed.forEach((url, idx) => {
        const record = new Record(sliders)
        record.set("image_url", url)
        record.set("order", idx)
        record.set("active", true)
        app.save(record)
    })
}, (app) => {
    try {
        app.delete(app.findCollectionByNameOrId("sliders"))
    } catch (error) {
        if (!error.message.includes("no rows in result set")) throw error
    }
})
