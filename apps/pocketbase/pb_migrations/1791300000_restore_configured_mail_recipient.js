/// <reference path="../pb_data/types.d.ts" />

// The three explicitly removed legacy recipients left the saved admin list
// empty. Restore the one recipient that was meant to remain configured. The
// notification hook still reads only recipientsJson and has no fallback list.
migrate((app) => {
    const settings = app.settings();
    const email = "nguy3nantam@gmail.com";

    let recipients = [];
    try {
        recipients = JSON.parse(settings.meta.recipientsJson || "[]");
        if (!Array.isArray(recipients)) recipients = [];
    } catch (error) {
        recipients = [];
    }

    if (!recipients.some((recipient) => (
        String(recipient.email || "").trim().toLowerCase() === email
    ))) {
        recipients.push({
            id: "r2",
            email,
            note: "Quản trị viên hệ thống",
            active: true,
        });
    }

    settings.meta.recipientsJson = JSON.stringify(recipients);
    settings.meta.notificationEmails = recipients
        .filter((recipient) => recipient.active !== false)
        .map((recipient) => String(recipient.email || "").trim())
        .filter(Boolean)
        .join(",");
    app.save(settings);
});
