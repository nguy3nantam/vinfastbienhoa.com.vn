/// <reference path="../pb_data/types.d.ts" />

// Cập nhật giá và thông số VinFast Wild theo vinfastauto.com
// Nguồn: https://vinfastauto.com/vn_vi — "Giá bán từ 860.000.000 VNĐ"
migrate((app) => {
    let record = null;
    try {
        record = app.findFirstRecordByFilter("vehicles", "slug = 'wild'");
    } catch (err) {
        record = null;
    }

    if (!record) {
        // Chưa có bản ghi Wild thì tạo mới
        const collection = app.findCollectionByNameOrId("vehicles");
        record = new Record(collection);
        record.set("slug", "wild");
        record.set("name", "VinFast Wild");
        record.set("category", "electric");
        record.set("order", 9);
        record.set("color", "Xám Ánh Kim");
        record.set("active", true);
    }

    record.set("price", "860.000.000");
    record.set("tagline", "Bán tải điện 5 chỗ — kết hợp xăng & điện, hành trình tới 1.000 km.");
    record.set("image_url", "https://static-cms-prod.vinfastauto.com/hinh-anh-vinfast-vf-wild-text-logo-home.webp");
    record.set("specs", [
        { label: "Di chuyển (kết hợp xăng & điện)", value: "Lên tới 1.000 km (NEDC)" },
        { label: "Số chỗ ngồi", value: "5 chỗ" },
        { label: "Dòng xe", value: "Bán tải điện" },
        { label: "Giá bán từ", value: "860.000.000 VNĐ" },
    ]);

    app.save(record);
});
