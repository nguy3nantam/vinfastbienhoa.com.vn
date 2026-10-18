/// <reference path="../pb_data/types.d.ts" />

// PocketBase settings meta is persisted reliably when replaced as a whole.
// Keep the admin-configured recipient list explicit and authoritative.
migrate((app) => {
    const settings = app.settings();
    const email = "nguy3nantam@gmail.com";
    const recipient = {
        id: "r2",
        email,
        note: "Quản trị viên hệ thống",
        active: true,
    };
    const meta = { ...(settings.meta || {}) };

    let recipients = [];
    try {
        recipients = JSON.parse(meta.recipientsJson || "[]");
        if (!Array.isArray(recipients)) recipients = [];
    } catch (error) {
        recipients = [];
    }

    const existingIndex = recipients.findIndex((item) => (
        String(item.email || "").trim().toLowerCase() === email
    ));
    if (existingIndex >= 0) {
        recipients[existingIndex] = { ...recipients[existingIndex], active: true };
    } else {
        recipients.push(recipient);
    }

    meta.recipientsJson = JSON.stringify(recipients);
    meta.notificationEmails = recipients
        .filter((item) => item.active !== false)
        .map((item) => String(item.email || "").trim())
        .filter(Boolean)
        .join(",");
    settings.meta = meta;
    app.save(settings);
});
