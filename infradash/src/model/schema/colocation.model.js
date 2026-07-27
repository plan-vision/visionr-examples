module.exports = {
    icon: "domain",
    properties: {
        "main.location": {
            code: "code.unique",
            country: {template: "relation.obligatory", related: "library.country"},
            city: {template: "relation.obligatory", related: "library.city"},
            address: "text",
            timezone: "varchar",
            status: {
                template: "relation.obligatory",
                related: "infra.lifecycle_status"
            },
            racks: {template: "relation", parent: "infra.rack.colocation"}
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,code,name,country,city,status"}}},
    highlighting: {path: "status.color"}
};
