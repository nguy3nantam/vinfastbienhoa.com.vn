/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const settings = app.settings();
    const removedEmail = "kinhdoanh@vinfastbienhoa.com.vn";

    let recipients = [];
    try {
        recipients = JSON.parse(settings.meta.recipientsJson || "[]");
        if (!Array.isArray(recipients)) recipients = [];
    } catch (error) {
        recipients = [];
    }

    recipients = recipients.filter((recipient) => (
        String(recipient.email || "").trim().toLowerCase() !== removedEmail
    ));

    settings.meta.recipientsJson = JSON.stringify(recipients);
    settings.meta.notificationEmails = recipients
        .filter((recipient) => recipient.active !== false)
        .map((recipient) => String(recipient.email || "").trim())
        .filter(Boolean)
        .join(",");
    app.save(settings);
});
