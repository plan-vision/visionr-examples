module.exports = {
    icon: "warning",
    hierarchies: [
        {
            code: "infra.incident_impact",
            path: "infra.colocation.racks.servers.incidents",
            count: true,
            visibleWithLeaf: false,
            leafs: false,
            defaultRecursive: false
        }
    ],
    properties: {
        "main.operations": {
            code: "code.unique",
            status: {
                template: "relation.obligatory",
                related: "infra.incident_status"
            },
            severity: {
                template: "relation.obligatory",
                related: "infra.impact_level"
            },
            reported_at: {template: "datetime.obligatory", format: "datetime_hour_minutes"},
            resolved_at: {template: "datetime", format: "datetime_hour_minutes"},
            server: {template: "relation", related: "infra.server"},
            service: {template: "relation", related: "infra.service"},
            assignee: "varchar",
            resolution: "text"
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,code,name,status,severity,reported_at,server,service,assignee"}}},
    highlighting: {path: "severity.color"}
};
