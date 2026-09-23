/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const sliders = app.findCollectionByNameOrId("sliders")
    if (!sliders.fields.getByName("source_url")) {
        sliders.fields.add(new Field({
            "name": "source_url",
            "type": "url",
            "required": false
        }))
        app.save(sliders)
    }
}, (app) => {
    const sliders = app.findCollectionByNameOrId("sliders")
    const field = sliders.fields.getByName("source_url")
    if (field) {
        sliders.fields.removeById(field.id)
        app.save(sliders)
    }
})
