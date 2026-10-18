/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  const DOMAIN = "vinfastbienhoa.com.vn";
  const record = e.record;

  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const name = record.get("name") || "";
  const phone = record.get("phone") || "";
  const model = record.get("model") || "";
  const request = record.get("color") || "";
  const message = record.get("message") || "";

  const html = `
    <p><strong>Tên Khách Hàng :</strong> ${escapeHtml(name)}</p>
    <p><strong>Số Điện Thoại :</strong> ${escapeHtml(phone)}</p>
    <p><strong>Model Xe :</strong> ${escapeHtml(model)}</p>
    <p><strong>Yêu cầu hỗ trợ :</strong> ${escapeHtml(request)}</p>
    <p><strong>Lời nhắn :</strong> ${escapeHtml(message)}</p>
    <p>${DOMAIN}</p>
  `;

  const meta = $app.settings().meta || {};
  const smtp = $app.settings().smtp || {};
  let recipientEmails = [];

  let recipientsJson = "[]";
  try {
    const mailSettings = $app.findFirstRecordByFilter("mail_settings", "id != ''");
    recipientsJson = mailSettings.get("recipients_json") || "[]";
  } catch (err) {
    $app.logger().error("contact notification email skipped: mail settings unavailable", "err", String(err));
  }

  if (recipientsJson) {
    try {
      const parsed = JSON.parse(recipientsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        recipientEmails = parsed
          .filter((r) => r.active !== false)
          .map((r) => String(r.email || "").trim().toLowerCase())
          .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      }
    } catch (err) { }
  }

  recipientEmails = [...new Set(recipientEmails)];

  if (recipientEmails.length === 0) {
    $app.logger().warn("contact notification email skipped: no active recipients");
    e.next();
    return;
  }

  const toList = recipientEmails.map((addr) => ({ address: addr }));

  const message_ = new MailerMessage({
    from: {
      name: meta.senderName || "VinFast Kim Sơn",
      address: smtp.username || meta.senderAddress || "no-reply@vinfastbienhoa.com.vn",
    },
    to: toList,
    subject: `KHTN ${DOMAIN}`,
    html,
  });

  try {
    $app.newMailClient().send(message_);
    $app.logger().info("contact notification email sent", "to", recipientEmails.join(","), "from", smtp.username || meta.senderAddress);
  } catch (err) {
    $app.logger().error("contact notification email failed", "err", String(err), "stack", err?.stack || "");
  }

  e.next();
}, "contacts");
