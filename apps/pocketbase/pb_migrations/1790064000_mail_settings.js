/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let settings = app.settings();

    const senders = [
      {
        id: "s1",
        name: "VinFast Kim Sơn - Thông báo hệ thống",
        email: "no-reply@vinfastbienhoa.com.vn",
        role: "Thông báo hệ thống",
        isDefault: true,
        active: true,
      },
      {
        id: "s2",
        name: "Phòng Kinh Doanh & Báo Giá",
        email: "kd@vinfastbienhoa.com.vn",
        role: "Tư vấn & Báo giá",
        isDefault: false,
        active: true,
      },
      {
        id: "s3",
        name: "Chăm Sóc Khách Hàng & Dịch Vụ",
        email: "cskh@vinfastbienhoa.com.vn",
        role: "Hỗ trợ & Dịch vụ",
        isDefault: false,
        active: true,
      },
    ];

    const recipients = [
      { id: "r1", email: "tan.tranminh@vinfastbienhoa.vn", note: "Trưởng phòng kinh doanh", active: true },
      { id: "r2", email: "nguy3nantam@gmail.com", note: "Quản trị viên hệ thống", active: true },
      { id: "r3", email: "admin@vinfastbienhoa.com.vn", note: "Quản trị viên chính", active: true },
      { id: "r4", email: "kinhdoanh@vinfastbienhoa.com.vn", note: "Bộ phận tư vấn lái thử", active: true },
    ];

    settings.meta.senderName = "VinFast Kim Sơn";
    settings.meta.senderAddress = "no-reply@vinfastbienhoa.com.vn";
    settings.meta.sendersJson = JSON.stringify(senders);
    settings.meta.recipientsJson = JSON.stringify(recipients);
    settings.meta.notificationEmails = recipients.map((r) => r.email).join(",");

    app.save(settings);
});

