/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const vehicles = new Collection({
        "name": "vehicles",
        "type": "base",
        "listRule": "active = true || @request.auth.collectionName = 'users'",
        "viewRule": "active = true || @request.auth.collectionName = 'users'",
        "createRule": "@request.auth.collectionName = 'users'",
        "updateRule": "@request.auth.collectionName = 'users'",
        "deleteRule": "@request.auth.collectionName = 'users'",
        "fields": [
            {
                "name": "slug",
                "type": "text",
                "required": true,
                "max": 60
            },
            {
                "name": "name",
                "type": "text",
                "required": true,
                "max": 120
            },
            {
                "name": "category",
                "type": "select",
                "required": true,
                "maxSelect": 1,
                "values": ["electric", "service"]
            },
            {
                "name": "tagline",
                "type": "text",
                "required": false,
                "max": 300
            },
            {
                "name": "price",
                "type": "text",
                "required": false,
                "max": 40
            },
            {
                "name": "image",
                "type": "file",
                "required": false,
                "maxSelect": 1,
                "maxSize": 8388608,
                "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
            },
            {
                "name": "image_url",
                "type": "url",
                "required": false
            },
            {
                "name": "color",
                "type": "text",
                "required": false,
                "max": 60
            },
            {
                "name": "specs",
                "type": "json",
                "required": false,
                "maxSize": 10000
            },
            {
                "name": "order",
                "type": "number",
                "required": false
            },
            {
                "name": "active",
                "type": "bool",
                "required": false
            },
            {
                "name": "created",
                "type": "autodate",
                "onCreate": true,
                "onUpdate": false
            },
            {
                "name": "updated",
                "type": "autodate",
                "onCreate": true,
                "onUpdate": true
            }
        ],
        "indexes": [
            "CREATE UNIQUE INDEX `idx_vehicles_slug` ON `vehicles` (`slug`)"
        ]
    })
    app.save(vehicles)

    const seed = [
        { slug: "vf2", name: "VinFast VF 2", category: "electric", order: 0, tagline: "Ô tô điện mini đô thị — nhỏ gọn, giá siêu hấp dẫn.", price: "178.600.000", image_url: "https://static-cms-prod.vinfastauto.com/vf2_home_page.png", color: "Trắng", specs: [{ label: "Quãng đường / lần sạc", value: "180 km" }, { label: "Công suất tối đa", value: "40.8 mã lực (30 kW)" }, { label: "Tốc độ tối đa", value: "80 km/h" }, { label: "Số chỗ ngồi", value: "4 chỗ" }] },
        { slug: "vf3", name: "VinFast VF 3", category: "electric", order: 1, tagline: "Mini SUV điện đô thị — nhỏ gọn, cá tính, linh hoạt.", price: "270.750.000", image_url: "https://static-cms-prod.vinfastauto.com/statics/img/homepage-v2/car/VF3.webp", color: "Herio Green", specs: [{ label: "Quãng đường / lần sạc", value: "210 km" }, { label: "Công suất tối đa", value: "43.5 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "12.5 giây" }, { label: "Số chỗ ngồi", value: "4 chỗ" }] },
        { slug: "vf5", name: "VinFast VF 5", category: "electric", order: 2, tagline: "SUV điện cỡ B — rộng rãi, hiện đại, tiết kiệm.", price: "471.200.000", image_url: "https://static-cms-prod.vinfastauto.com/statics/img/homepage-v2/car/VF5.webp", color: "Trắng", specs: [{ label: "Quãng đường / lần sạc", value: "326 km" }, { label: "Công suất tối đa", value: "134 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "10.5 giây" }, { label: "Số chỗ ngồi", value: "5 chỗ" }] },
        { slug: "vf6", name: "VinFast VF 6", category: "electric", order: 3, tagline: "SUV điện cỡ C — mạnh mẽ, công nghệ, an toàn.", price: "613.700.000", image_url: "https://static-cms-prod.vinfastauto.com/statics/img/homepage-v2/car/VF6.webp", color: "Trắng", specs: [{ label: "Quãng đường / lần sạc", value: "399 km" }, { label: "Công suất tối đa", value: "201 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "8.9 giây" }, { label: "Số chỗ ngồi", value: "5 chỗ" }] },
        { slug: "vf7", name: "VinFast VF 7", category: "electric", order: 4, tagline: "SUV điện cỡ C+ — hiệu suất vượt trội, sang trọng.", price: "703.000.000", image_url: "https://static-cms-prod.vinfastauto.com/statics/img/homepage-v2/car/VF7.webp", color: "Trắng", specs: [{ label: "Quãng đường / lần sạc", value: "450 km" }, { label: "Công suất tối đa", value: "348 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "5.8 giây" }, { label: "Số chỗ ngồi", value: "5 chỗ" }] },
        { slug: "vf8", name: "VinFast VF 8", category: "electric", order: 5, tagline: "SUV điện cỡ D — đẳng cấp, mạnh mẽ, toàn diện.", price: "853.100.000", image_url: "https://static-cms-prod.vinfastauto.com/statics/img/homepage-v2/car/VF8.webp", color: "Đỏ", specs: [{ label: "Quãng đường / lần sạc", value: "471 km" }, { label: "Công suất tối đa", value: "402 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "5.5 giây" }, { label: "Số chỗ ngồi", value: "5 chỗ" }] },
        { slug: "vf8-all-new", name: "VinFast VF 8 All New", category: "electric", order: 6, tagline: "Phiên bản nâng cấp — công nghệ mới, vận hành hoàn thiện.", price: "854.000.000", image_url: "https://static-cms-prod.vinfastauto.com/vf8-all-new.png", color: "Trắng", specs: [{ label: "Quãng đường / lần sạc", value: "494 km" }, { label: "Công suất tối đa", value: "402 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "5.3 giây" }, { label: "Số chỗ ngồi", value: "5 chỗ" }] },
        { slug: "vf9", name: "VinFast VF 9", category: "electric", order: 7, tagline: "SUV điện cỡ E — flagship 7 chỗ, sang trọng bậc nhất.", price: "1.280.600.000", image_url: "https://static-cms-prod.vinfastauto.com/statics/img/homepage-v2/car/VF9.webp", color: "Đen", specs: [{ label: "Quãng đường / lần sạc", value: "531 km" }, { label: "Công suất tối đa", value: "402 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "6.5 giây" }, { label: "Số chỗ ngồi", value: "7 chỗ" }] },
        { slug: "mpv7", name: "VinFast MPV7", category: "electric", order: 8, tagline: "MPV điện 7 chỗ — rộng rãi cho cả gia đình.", price: "712.500.000", image_url: "https://static-cms-prod.vinfastauto.com/pdp/vf_mpv_7/Homepage_MPV7.webp", color: "Đỏ", specs: [{ label: "Quãng đường / lần sạc", value: "420 km" }, { label: "Công suất tối đa", value: "268 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "8.5 giây" }, { label: "Số chỗ ngồi", value: "7 chỗ" }] },
        { slug: "minio-green", name: "VinFast Minio Green", category: "service", order: 0, tagline: "Ô tô điện dịch vụ hạng A — tối ưu chi phí vận hành.", price: "178.600.000", image_url: "https://static-cms-prod.vinfastauto.com/statics/img/homepage-v2/car/MinioGreen.webp", color: "Đỏ", specs: [{ label: "Quãng đường / lần sạc", value: "170 km" }, { label: "Công suất tối đa", value: "39.7 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "13 giây" }, { label: "Số chỗ ngồi", value: "4 chỗ" }] },
        { slug: "herio-green", name: "VinFast Herio Green", category: "service", order: 1, tagline: "Ô tô điện dịch vụ đô thị — bền bỉ, kinh tế.", price: "427.500.000", image_url: "https://static-cms-prod.vinfastauto.com/heriogreen.webp", color: "Xanh Herio", specs: [{ label: "Quãng đường / lần sạc", value: "210 km" }, { label: "Công suất tối đa", value: "43.5 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "12.5 giây" }, { label: "Số chỗ ngồi", value: "4 chỗ" }] },
        { slug: "nerio-green", name: "VinFast Nerio Green", category: "service", order: 2, tagline: "Ô tô điện dịch vụ hạng B — thoải mái cho hành trình dài.", price: "668.000.000", image_url: "https://static-cms-prod.vinfastauto.com/neriogreen.webp", color: "Đen", specs: [{ label: "Quãng đường / lần sạc", value: "326 km" }, { label: "Công suất tối đa", value: "134 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "10.5 giây" }, { label: "Số chỗ ngồi", value: "5 chỗ" }] },
        { slug: "limo-green", name: "VinFast Limo Green", category: "service", order: 3, tagline: "Ô tô điện dịch vụ cao cấp — lý tưởng cho taxi, đưa đón.", price: "664.050.000", image_url: "https://static-cms-prod.vinfastauto.com/limo.png", color: "Xanh Limo", specs: [{ label: "Quãng đường / lần sạc", value: "399 km" }, { label: "Công suất tối đa", value: "201 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "8.9 giây" }, { label: "Số chỗ ngồi", value: "5 chỗ" }] },
        { slug: "ec-van", name: "VinFast EC Van", category: "service", order: 4, tagline: "Xe điện chở hàng — bền bỉ, tải trọng lớn, chi phí thấp.", price: "230.640.000", image_url: "https://static-cms-prod.vinfastauto.com/ecvan-02.webp", color: "Xanh Lá", specs: [{ label: "Quãng đường / lần sạc", value: "300 km" }, { label: "Công suất tối đa", value: "94 mã lực" }, { label: "Tăng tốc 0-100 km/h", value: "11 giây" }, { label: "Tải trọng", value: "600 kg" }] },
    ]

    seed.forEach((item) => {
        const record = new Record(vehicles)
        record.set("slug", item.slug)
        record.set("name", item.name)
        record.set("category", item.category)
        record.set("tagline", item.tagline)
        record.set("price", item.price)
        record.set("image_url", item.image_url)
        record.set("color", item.color)
        record.set("specs", item.specs)
        record.set("order", item.order)
        record.set("active", true)
        app.save(record)
    })
}, (app) => {
    try {
        app.delete(app.findCollectionByNameOrId("vehicles"))
    } catch (error) {
        if (!error.message.includes("no rows in result set")) throw error
    }
})
