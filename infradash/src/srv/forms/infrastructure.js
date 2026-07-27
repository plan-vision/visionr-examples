const forms = require("server/forms");

forms.define({
    "infra.colocation": {
        view: "table",
        highlighting: "infra.colocation:status.color",
        orderBy: "name"
    },
    "infra.rack": {
        view: "table",
        highlighting: "infra.rack:status.color",
        hierarchy: false,
        orderBy: "colocation,name"
    },
    "infra.server": {
        view: "table",
        highlighting: "infra.server:status.color",
        hierarchy: "infra.physical_inventory",
        orderBy: "asset_tag"
    },
    "infra.component": {
        view: "table",
        highlighting: "infra.component:status.color",
        hierarchy: "infra.physical_components",
        orderBy: "server,name"
    },
    "infra.service": {
        view: "table",
        highlighting: "infra.service:status.color",
        hierarchy: "infra.service_hosting",
        orderBy: "name"
    },
    "infra.incident": {
        view: "table",
        highlighting: "infra.incident:severity.color",
        hierarchy: "infra.incident_impact",
        orderBy: "reported_at DESC"
    },
    "infra.lifecycle_status": {
        view: "table",
        orderBy: "name"
    },
    "infra.incident_status": {
        view: "table",
        orderBy: "name"
    },
    "infra.impact_level": {
        view: "table",
        orderBy: "sort_order"
    }
});
