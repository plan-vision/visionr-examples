module.exports = {
    icon: "memory",
    hierarchies: [
        {
            code: "infra.physical_components",
            path: "infra.colocation.racks.servers.components",
            count: true,
            visibleWithLeaf: false,
            leafs: false,
            defaultRecursive: false
        }
    ],
    properties: {
        "main.asset": {
            code: "code.unique",
            server: {template: "relation.obligatory", related: "infra.server"},
            component_type: {
                template: "option.obligatory",
                optionSet: {
                    code: "infra_component_type",
                    options: ["cpu", "memory", "storage", "network", "power"]
                }
            },
            serial_number: "varchar",
            capacity: "varchar",
            status: {
                template: "relation.obligatory",
                related: "infra.lifecycle_status"
            }
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,code,name,component_type,server,serial_number,capacity,status"}}},
    highlighting: {path: "status.color"}
};
