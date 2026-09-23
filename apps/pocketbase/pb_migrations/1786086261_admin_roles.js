/// <reference path="../pb_data/types.d.ts" />

// Phân quyền quản trị:
// - Admin = tài khoản trong `_superusers` (không đổi, toàn quyền mặc định của PocketBase).
// - User  = tài khoản trong collection `users` (trước đây chưa được dùng ở đâu trong app).
//   Chỉ được: quản lý tin tức (news), danh sách form liên hệ (contacts), slider (sliders).
//   Không được: quản lý người dùng, cấu hình website/email (những phần đó chỉ Admin/superuser
//   mới gọi được, vì nằm ở API /api/settings và collection `_superusers` do PocketBase khóa cứng).
migrate((app) => {
    // `users` trước đây cho phép đăng ký công khai (createRule: ""). Vì giờ collection này
    // dùng làm tài khoản nhân sự nội bộ, khóa lại: chỉ Admin (superuser) mới tạo được tài khoản User.
    const users = app.findCollectionByNameOrId("users")
    users.createRule = null
    app.save(users)

    const managerRule = "@request.auth.collectionName = 'users' || @request.auth.collectionName = '_superusers'"

    const news = app.findCollectionByNameOrId("news")
    news.listRule = `published = true || ${managerRule}`
    news.viewRule = `published = true || ${managerRule}`
    news.createRule = managerRule
    news.updateRule = managerRule
    news.deleteRule = managerRule
    app.save(news)

    const sliders = app.findCollectionByNameOrId("sliders")
    sliders.listRule = `active = true || ${managerRule}`
    sliders.viewRule = `active = true || ${managerRule}`
    sliders.createRule = managerRule
    sliders.updateRule = managerRule
    sliders.deleteRule = managerRule
    app.save(sliders)

    const contacts = app.findCollectionByNameOrId("contacts")
    // createRule giữ nguyên ("") để form liên hệ công khai trên website vẫn gửi được.
    contacts.listRule = managerRule
    contacts.viewRule = managerRule
    contacts.deleteRule = managerRule
    app.save(contacts)
}, (app) => {
    const users = app.findCollectionByNameOrId("users")
    users.createRule = ""
    app.save(users)

    const news = app.findCollectionByNameOrId("news")
    news.listRule = "published = true"
    news.viewRule = "published = true"
    news.createRule = null
    news.updateRule = null
    news.deleteRule = null
    app.save(news)

    const sliders = app.findCollectionByNameOrId("sliders")
    sliders.listRule = "active = true"
    sliders.viewRule = "active = true"
    sliders.createRule = null
    sliders.updateRule = null
    sliders.deleteRule = null
    app.save(sliders)

    const contacts = app.findCollectionByNameOrId("contacts")
    contacts.listRule = null
    contacts.viewRule = null
    contacts.deleteRule = null
    app.save(contacts)
})
