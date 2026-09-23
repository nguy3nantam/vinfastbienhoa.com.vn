/// <reference path="../pb_data/types.d.ts" />

// Đánh dấu các slider do bộ đồng bộ VinFast tạo là "managed".
// Một slider chỉ còn được bộ đồng bộ tự cập nhật khi managed=true.
// Khi admin chỉnh sửa slide từ /admin (hook onRecordUpdateRequest), cờ này
// sẽ được gán false để dừng việc đồng bộ ghi đè nội dung người dùng đã sửa.
migrate((app) => {
    const sliders = app.findCollectionByNameOrId("sliders")
    if (!sliders.fields.getByName("managed")) {
        sliders.fields.add(new Field({
            "name": "managed",
            "type": "bool",
            "required": false
        }))
        app.save(sliders)
    }

    const records = app.findRecordsByFilter("sliders", "", "created", 1000, 0)
    records.forEach((record) => {
        if (!record.getBool("managed")) {
            record.set("managed", true)
            app.save(record)
        }
    })
}, (app) => {
    const sliders = app.findCollectionByNameOrId("sliders")
    const field = sliders.fields.getByName("managed")
    if (field) {
        sliders.fields.removeById(field.id)
        app.save(sliders)
    }
})