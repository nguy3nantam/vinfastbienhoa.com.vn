/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const settings = app.settings()
    const rules = settings.rateLimits?.rules || []
    const label = "POST /api/collections/contacts/records"

    settings.rateLimits = {
        ...(settings.rateLimits || {}),
        enabled: true,
        rules: [
            ...rules.filter((rule) => rule.label !== label),
            {
                label,
                audience: "@guest",
                duration: 10 * 60,
                maxRequests: 10,
            },
        ],
    }

    app.save(settings)
}, (app) => {
    const settings = app.settings()
    const label = "POST /api/collections/contacts/records"

    settings.rateLimits = {
        ...(settings.rateLimits || {}),
        rules: (settings.rateLimits?.rules || []).filter((rule) => rule.label !== label),
    }

    app.save(settings)
})
