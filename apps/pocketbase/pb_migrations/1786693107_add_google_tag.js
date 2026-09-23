/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const settings = app.findCollectionByNameOrId("site_settings")
    settings.fields.add(new Field({
        "name": "google_tag_id",
        "type": "text",
        "required": false,
        "max": 20
    }))
    app.save(settings)
}, (app) => {
    const settings = app.findCollectionByNameOrId("site_settings")
    settings.fields.removeByName("google_tag_id")
    app.save(settings)
})
