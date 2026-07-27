module.exports = {
    icon: "dns",
    hierarchies: [
        {
            code: "infra.physical_inventory",
            path: "infra.colocation.racks.servers",
            count: true,
            visibleWithLeaf: false,
            leafs: false,
            defaultRecursive: false
        }
    ],
    properties: {
        "main.asset": {
            code: "code.unique",
            asset_tag: "varchar",
            serial_number: "varchar",
            device_model: {template: "relation.obligatory", related: "infra.device_model"},
            rack: {template: "relation.obligatory", related: "infra.rack"},
            rack_position: {template: "integer", unit: "U"},
            status: {
                template: "relation.obligatory",
                related: "infra.lifecycle_status"
            },
            environment: {
                template: "option.obligatory",
                optionSet: {
                    code: "infra_environment",
                    options: ["production", "staging", "development", "test"]
                }
            },
            ip_address: "varchar",
            cpu_cores: "integer",
            memory_gb: {template: "integer", unit: "GB"},
            storage_gb: {template: "integer", unit: "GB"},
            installed_at: "date",
            warranty_until: "date",
            services: {template: "relation", parent: "infra.service.servers"},
            components: {template: "relation", parent: "infra.component.server"},
            incidents: {template: "relation", parent: "infra.incident.server"}
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,asset_tag,name,status,environment,device_model,rack,rack_position,ip_address,cpu_cores,memory_gb"}}},
    highlighting: {path: "status.color"}
};
