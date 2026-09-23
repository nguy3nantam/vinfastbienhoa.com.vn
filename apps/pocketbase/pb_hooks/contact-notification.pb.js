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
  let recipientEmails = ["tan.tranminh@vinfastbienhoa.vn", "nguy3nantam@gmail.com", "admin@vinfastbienhoa.com.vn", "kinhdoanh@vinfastbienhoa.com.vn"];

  if (meta.notificationEmails) {
    const list = meta.notificationEmails.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) recipientEmails = list;
  } else if (meta.recipientsJson) {
    try {
      const parsed = JSON.parse(meta.recipientsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        recipientEmails = parsed.map((r) => r.email).filter(Boolean);
      }
    } catch (err) { }
  }

  const toList = recipientEmails.map((addr) => ({ address: addr }));

  const message_ = new MailerMessage({
    from: {
      name: meta.senderName || "VinFast Kim Sơn",
      address: meta.senderAddress || "no-reply@vinfastbienhoa.com.vn",
    },
    to: toList,
    subject: `KHTN ${DOMAIN}`,
    html,
  });

  try {
    $app.newMailClient().send(message_);
    $app.logger().info("contact notification email sent", "to", recipientEmails.join(","), "from", meta.senderAddress);
  } catch (err) {
    $app.logger().error("contact notification email failed", "err", String(err), "stack", err?.stack || "");
  }

  e.next();
}, "contacts");
