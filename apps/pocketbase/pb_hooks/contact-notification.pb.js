/// <reference path="../pb_data/types.d.ts" />

// SMTP must never delay the public form after its contact record is saved.
onRecordAfterCreateSuccess((e) => {
  e.next();
  e.record.set("mail_status", "pending");
  e.record.set("mail_attempts", 0);
  e.record.set("mail_error", "");
  $app.save(e.record);
}, "contacts");

// This cron callback runs independently from the request that created the
// contact. Process one notification at a time to keep outages bounded.
cronAdd("contact-notification-mail", "* * * * *", () => {
  const DOMAIN = "vinfastbienhoa.com.vn";
  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  let records = [];
  try {
    records = $app.findRecordsByFilter(
      "contacts",
      "mail_status = 'pending' || (mail_status = 'failed' && mail_attempts < 3)",
      "created", 1, 0
    );
  } catch (err) {
    $app.logger().error("contact notification queue unavailable", "err", String(err));
    console.log(`contact notification queue unavailable: ${String(err)}`);
    return;
  }
  if (records.length === 0) return;

  const record = records[0];
  const attempts = Number(record.get("mail_attempts") || 0) + 1;
  record.set("mail_status", "sending");
  record.set("mail_attempts", attempts);
  record.set("mail_error", "");
  $app.save(record);

  try {
    const meta = $app.settings().meta || {};
    const smtp = $app.settings().smtp || {};
    const mailSettings = $app.findFirstRecordByFilter("mail_settings", "id != ''");
    let recipients = [];
    try {
      const parsed = JSON.parse(mailSettings.get("recipients_json") || "[]");
      if (Array.isArray(parsed)) {
        recipients = parsed.filter((item) => item.active !== false)
          .map((item) => String(item.email || "").trim().toLowerCase())
          .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      }
    } catch (err) { }
    recipients = [...new Set(recipients)];
    if (recipients.length === 0) throw new Error("no active notification recipients");

    const request = record.get("support") || record.get("color") || "";
    const message = record.get("message") || "";
    const messageHtml = message ? `<p><strong>Lời nhắn :</strong> ${escapeHtml(message)}</p>` : "";
    const html = `
      <p><strong>Tên Khách Hàng :</strong> ${escapeHtml(record.get("name") || "")}</p>
      <p><strong>Số Điện Thoại :</strong> ${escapeHtml(record.get("phone") || "")}</p>
      <p><strong>Model Xe :</strong> ${escapeHtml(record.get("model") || "")}</p>
      <p><strong>Yêu cầu hỗ trợ :</strong> ${escapeHtml(request)}</p>
      ${messageHtml}<p>${DOMAIN}</p>`;

    $app.newMailClient().send(new MailerMessage({
      from: {
        name: meta.senderName || "VinFast Kim Sơn",
        address: smtp.username || meta.senderAddress || "no-reply@vinfastbienhoa.com.vn",
      },
      to: recipients.map((address) => ({ address })),
      subject: `KHTN ${DOMAIN}`,
      html,
    }));

    record.set("mail_status", "sent");
    record.set("mail_error", "");
    record.set("mail_sent_at", new Date().toISOString());
    $app.save(record);
    $app.logger().info("contact notification email sent", "contact", record.id, "to", recipients.join(","));
    console.log(`contact notification email sent for ${record.id} to ${recipients.join(",")}`);
  } catch (err) {
    record.set("mail_status", "failed");
    record.set("mail_error", String(err).slice(0, 1000));
    $app.save(record);
    $app.logger().error("contact notification email failed", "contact", record.id, "attempt", attempts, "err", String(err));
    console.log(`contact notification email failed for ${record.id} attempt ${attempts}: ${String(err)}`);
  }
});
