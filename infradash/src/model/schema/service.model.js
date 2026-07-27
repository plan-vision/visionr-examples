module.exports = {
    icon: "cloud",
    hierarchies: [
        {
            code: "infra.service_hosting",
            path: "infra.colocation.racks.servers.services",
            count: true,
            visibleWithLeaf: false,
            leafs: false,
            defaultRecursive: false
        }
    ],
    properties: {
        "main.operations": {
            code: "code.unique",
            owner_team: "varchar",
            criticality: {
                template: "relation.obligatory",
                related: "infra.impact_level"
            },
            status: {
                template: "relation.obligatory",
                related: "infra.lifecycle_status"
            },
            servers: {template: "relation.multiple", related: "infra.server"},
            dependencies: {template: "relation.multiple", related: "infra.service"},
            incidents: {template: "relation", parent: "infra.incident.service"}
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,code,name,owner_team,criticality,status,servers"}}},
    highlighting: {path: "status.color"}
};
