
/// <reference path="../pb_data/types.d.ts" />

// Trên môi trường preview của Hostinger Horizons, email được gửi qua dịch vụ
// "Builder Mailer" nội bộ (BUILDER_MAILER_API_URL/API_KEY). Dịch vụ đó không
// khả dụng trên VPS tự host, nên nếu SMTP chưa được bật/cấu hình trong Admin
// > Cấu hình gửi mail, chặn sớm với thông báo rõ ràng thay vì để PocketBase
// gọi ra một URL rỗng và trả về lỗi khó hiểu.
onMailerSend((e) => {
    if (e.app.settings().smtp.enabled) {
        return e.next()
    }

    const apiUrl = $os.getenv("BUILDER_MAILER_API_URL");
    const apiKey = $os.getenv("BUILDER_MAILER_API_KEY");

    if (!apiUrl || !apiKey) {
        $app.logger().error("Email not sent: SMTP is disabled and no BUILDER_MAILER_* env vars are configured");
        throw new ApiError(500, "Chưa cấu hình gửi mail. Vào Admin > Cấu hình gửi mail, bật SMTP và nhập thông tin máy chủ SMTP thật, sau đó lưu lại.");
    }

    const senderAddress = $os.getenv("BUILDER_MAILER_SENDER_ADDRESS");

    const payload = {
        "subject": e.message.subject,
        "content": {
            ...(e.message.html ? {
                "html": e.message.html,
            } : {
                "text": e.message.text,
            }),
            "type": "plain",
        },
        "from": senderAddress,
        "fromName": e.message.from?.name,
        "replyTo": senderAddress,
        "to": e.message.to[0].address,
    }

    const response = $http.send({
        url: `${apiUrl}/api/v2/email`,
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (response.statusCode !== 200) {
        $app.logger().error("Failed to send email", "error", response.json);

        throw new ApiError(500, response.json?.message || 'Failed to send email');
    }
})
