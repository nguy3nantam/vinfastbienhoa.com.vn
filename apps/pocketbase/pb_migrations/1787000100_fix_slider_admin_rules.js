/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const managerRule = "@request.auth.collectionName = 'users' || @request.auth.collectionName = '_superusers'"

    const news = app.findCollectionByNameOrId("news")
    if (news) {
        news.listRule = `published = true || ${managerRule}`
        news.viewRule = `published = true || ${managerRule}`
        news.createRule = managerRule
        news.updateRule = managerRule
        news.deleteRule = managerRule
        app.save(news)
    }

    const sliders = app.findCollectionByNameOrId("sliders")
    if (sliders) {
        sliders.listRule = `active = true || ${managerRule}`
        sliders.viewRule = `active = true || ${managerRule}`
        sliders.createRule = managerRule
        sliders.updateRule = managerRule
        sliders.deleteRule = managerRule
        app.save(sliders)
    }

    const contacts = app.findCollectionByNameOrId("contacts")
    if (contacts) {
        contacts.listRule = managerRule
        contacts.viewRule = managerRule
        contacts.deleteRule = managerRule
        app.save(contacts)
    }
}, (app) => {
    const news = app.findCollectionByNameOrId("news")
    if (news) {
        news.listRule = "published = true"
        news.viewRule = "published = true"
        news.createRule = null
        news.updateRule = null
        news.deleteRule = null
        app.save(news)
    }

    const sliders = app.findCollectionByNameOrId("sliders")
    if (sliders) {
        sliders.listRule = "active = true"
        sliders.viewRule = "active = true"
        sliders.createRule = null
        sliders.updateRule = null
        sliders.deleteRule = null
        app.save(sliders)
    }

    const contacts = app.findCollectionByNameOrId("contacts")
    if (contacts) {
        contacts.listRule = null
        contacts.viewRule = null
        contacts.deleteRule = null
        app.save(contacts)
    }
})
