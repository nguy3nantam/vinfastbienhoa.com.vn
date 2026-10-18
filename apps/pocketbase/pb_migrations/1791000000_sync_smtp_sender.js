/// <reference path="../pb_data/types.d.ts" />

// PocketBase test emails use meta.senderAddress as the SMTP envelope sender.
// Keep it synchronized with the authenticated SMTP username so providers such
// as Yandex don't reject an unprovisioned alias with SMTP 553.
migrate((app) => {
    const settings = app.settings();
    const username = String(settings.smtp.username || "").trim();
    if (!settings.smtp.enabled || !username) return;

    settings.meta.senderAddress = username;

    let senders = [];
    try {
        senders = JSON.parse(settings.meta.sendersJson || "[]");
        if (!Array.isArray(senders)) senders = [];
    } catch (error) {
        senders = [];
    }

    let smtpSender = senders.find((sender) => String(sender.email || "").toLowerCase() === username.toLowerCase());
    if (!smtpSender) {
        smtpSender = {
            id: "smtp-account",
            name: settings.meta.senderName || "VinFast Kim Sơn",
            email: username,
            role: "Tài khoản SMTP thực tế",
            active: true,
        };
        senders.push(smtpSender);
    }

    senders = senders.map((sender) => ({
        ...sender,
        active: sender.id === smtpSender.id ? true : sender.active !== false,
        isDefault: sender.id === smtpSender.id,
    }));
    settings.meta.sendersJson = JSON.stringify(senders);
    app.save(settings);
    app.logger().info("SMTP sender synchronized with authenticated username", "sender", username);
});
