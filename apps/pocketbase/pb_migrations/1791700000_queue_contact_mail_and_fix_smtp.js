/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const contacts = app.findCollectionByNameOrId("contacts")
    const fields = [
        { name: "mail_status", type: "text", required: false, max: 20 },
        { name: "mail_attempts", type: "number", required: false, min: 0, max: 10 },
        { name: "mail_error", type: "text", required: false, max: 1000 },
        { name: "mail_sent_at", type: "date", required: false },
    ]
    fields.forEach((definition) => {
        if (!contacts.fields.getByName(definition.name)) contacts.fields.add(new Field(definition))
    })
    app.save(contacts)

    // Do not resend historical contacts during deployment.
    const existing = app.findRecordsByFilter("contacts", "mail_status = ''", "created", 10000, 0)
    existing.forEach((record) => {
        record.set("mail_status", "sent")
        app.save(record)
    })

    // Port 455 caused the observed connection timeouts. Restore the known
    // Yandex STARTTLS submission configuration.
    const settings = app.settings()
    if (settings.smtp.enabled && Number(settings.smtp.port) === 455) {
        settings.smtp.port = 587
        settings.smtp.tls = false
        app.save(settings)
        app.logger().info("corrected invalid SMTP port 455 to STARTTLS port 587")
    }
}, (app) => {
    const contacts = app.findCollectionByNameOrId("contacts")
    ;["mail_status", "mail_attempts", "mail_error", "mail_sent_at"].forEach((name) => {
        const field = contacts.fields.getByName(name)
        if (field) contacts.fields.removeById(field.id)
    })
    app.save(contacts)
})
