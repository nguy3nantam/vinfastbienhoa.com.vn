/// <reference path="../pb_data/types.d.ts" />

// Đồng bộ các thông số công khai với website VinFast Việt Nam ngày 17/10/2026.
migrate((app) => {
    const updates = {
        vf2: {
            price: "178.600.000",
            specs: [
                { label: "Quãng đường / lần sạc", value: "210 km (NEDC)" },
                { label: "Công suất tối đa", value: "40.8 mã lực (30 kW)" },
                { label: "Tốc độ tối đa", value: "80 km/h" },
                { label: "Số chỗ ngồi", value: "4 chỗ" },
            ],
        },
        mpv7: {
            specs: [
                { label: "Quãng đường / lần sạc", value: "450 km (NEDC)" },
                { label: "Công suất tối đa", value: "150 kW" },
                { label: "Mô-men xoắn cực đại", value: "280 Nm" },
                { label: "Số chỗ ngồi", value: "7 chỗ" },
            ],
        },
        "minio-green": {
            specs: [
                { label: "Quãng đường / lần sạc", value: "210 km (NEDC)" },
                { label: "Công suất tối đa", value: "30 kW" },
                { label: "Bảo hành", value: "7 năm hoặc 160.000 km" },
                { label: "Số chỗ ngồi", value: "4 chỗ" },
            ],
        },
        "herio-green": {
            specs: [
                { label: "Quãng đường / lần sạc", value: "326 km (NEDC)" },
                { label: "Công suất tối đa", value: "110 kW" },
                { label: "Dòng xe", value: "A-SUV" },
                { label: "Số chỗ ngồi", value: "5 chỗ" },
            ],
        },
        "nerio-green": {
            specs: [
                { label: "Quãng đường / lần sạc", value: "318,6 km (NEDC)" },
                { label: "Công suất tối đa", value: "110 kW" },
                { label: "Dòng xe", value: "B-SUV" },
                { label: "Số chỗ ngồi", value: "5 chỗ" },
            ],
        },
        "limo-green": {
            specs: [
                { label: "Quãng đường / lần sạc", value: "450 km (NEDC)" },
                { label: "Công suất tối đa", value: "150 kW" },
                { label: "Mô-men xoắn cực đại", value: "280 Nm" },
                { label: "Số chỗ ngồi", value: "7 chỗ" },
            ],
        },
        "ec-van": {
            specs: [
                { label: "Quãng đường / lần sạc", value: "175 km (NEDC)" },
                { label: "Số chỗ ngồi", value: "2 chỗ" },
                { label: "Dòng xe", value: "VAN" },
                { label: "Tải trọng", value: "600 kg" },
            ],
        },
    };

    Object.keys(updates).forEach((slug) => {
        let record;
        try {
            record = app.findFirstRecordByFilter("vehicles", `slug = '${slug}'`);
        } catch (error) {
            return;
        }

        const update = updates[slug];
        if (update.price) record.set("price", update.price);
        record.set("specs", update.specs);
        app.save(record);
    });
});
