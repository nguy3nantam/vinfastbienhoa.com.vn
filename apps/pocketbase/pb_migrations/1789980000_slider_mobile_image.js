migrate((app) => {
    const collection = app.findCollectionByNameOrId("sliders");
    if (!collection.fields.getByName("mobile_image_url")) {
        collection.fields.add(new Field({ name: "mobile_image_url", type: "url", required: false }));
        app.save(collection);
    }
}, (app) => {
    const collection = app.findCollectionByNameOrId("sliders");
    const field = collection.fields.getByName("mobile_image_url");
    if (field) {
        collection.fields.removeById(field.id);
        app.save(collection);
    }
});
