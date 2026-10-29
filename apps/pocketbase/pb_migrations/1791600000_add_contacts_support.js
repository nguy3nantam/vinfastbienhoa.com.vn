/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const contacts = app.findCollectionByNameOrId("contacts")
    if (!contacts.fields.getByName("support")) {
        contacts.fields.add(new Field({
            name: "support",
            type: "text",
            required: false,
            max: 120,
        }))
        app.save(contacts)
    }

    const limit = 1000
    for (let offset = 0; ; offset += limit) {
        const records = app.findRecordsByFilter("contacts", "", "created", limit, offset)
        records.forEach((record) => {
            const currentSupport = String(record.get("support") || "").trim()
            const legacySupport = String(record.get("color") || "").trim()
            if (!currentSupport && legacySupport) {
                record.set("support", legacySupport)
                app.save(record)
            }
        })
        if (records.length < limit) {
            break
        }
    }
}, (app) => {
    const contacts = app.findCollectionByNameOrId("contacts")
    const field = contacts.fields.getByName("support")
    if (field) {
        contacts.fields.removeById(field.id)
        app.save(contacts)
    }
})
