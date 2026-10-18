/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const adminRule = "@request.auth.collectionName = '_superusers'";
    const collection = new Collection({
        name: "mail_settings",
        type: "base",
        listRule: adminRule,
        viewRule: adminRule,
        createRule: adminRule,
        updateRule: adminRule,
        deleteRule: null,
        fields: [
            { name: "senders_json", type: "text", required: false, max: 20000 },
            { name: "recipients_json", type: "text", required: false, max: 20000 },
            { name: "created", type: "autodate", onCreate: true, onUpdate: false },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
    });
    app.save(collection);

    const settings = app.settings();
    const smtpEmail = String(settings.smtp.username || "").trim();
    const senders = smtpEmail ? [{
        id: "smtp-account",
        name: settings.meta.senderName || "VinFast Kim Sơn",
        email: smtpEmail,
        role: "Tài khoản SMTP thực tế",
        isDefault: true,
        active: true,
    }] : [];
    const recipients = [{
        id: "r2",
        email: "nguy3nantam@gmail.com",
        note: "Quản trị viên hệ thống",
        active: true,
    }];

    const record = new Record(collection);
    record.set("senders_json", JSON.stringify(senders));
    record.set("recipients_json", JSON.stringify(recipients));
    app.save(record);
}, (app) => {
    try {
        app.delete(app.findCollectionByNameOrId("mail_settings"));
    } catch (error) {
        if (!error.message.includes("no rows in result set")) throw error;
    }
});
