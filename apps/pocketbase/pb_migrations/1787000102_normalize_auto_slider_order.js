/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const sliders = app.findCollectionByNameOrId("sliders")
    const records = app.findRecordsByFilter("sliders", "source_url != ''", "created", 1000, 0)
    records.forEach((record, index) => {
        record.set("order", index)
        app.save(record)
    })
}, (app) => {
    // Order values are presentation data and do not need to be restored on revert.
})
