/// <reference path="../pb_data/types.d.ts" />

// Port 587 starts as plain SMTP and upgrades with STARTTLS. PocketBase uses
// smtp.tls=false for this mode; smtp.tls=true is implicit TLS (usually 465).
migrate((app) => {
    const settings = app.settings();
    if (settings.smtp.enabled && Number(settings.smtp.port) === 587 && settings.smtp.tls) {
        settings.smtp.tls = false;
        app.save(settings);
        app.logger().info("SMTP port 587 synchronized to STARTTLS mode");
    }
});
