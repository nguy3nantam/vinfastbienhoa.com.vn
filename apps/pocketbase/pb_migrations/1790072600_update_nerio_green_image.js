/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    try {
        const record = app.findFirstRecordByFilter("vehicles", "slug = 'nerio-green'");
        if (record) {
            record.set("image_url", "/nerio-green.png");
            app.save(record);
        }
    } catch (err) {
        // Record might not exist yet or collection missing
    }
});

