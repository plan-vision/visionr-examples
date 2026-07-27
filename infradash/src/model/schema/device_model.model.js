module.exports = {
    icon: "developer_board",
    properties: {
        "main.catalog": {
            code: "code.unique",
            vendor: {template: "relation.obligatory", related: "infra.vendor"},
            model_number: "varchar",
            form_factor: "varchar",
            rack_units: {template: "integer", unit: "U"},
            servers: {template: "relation", parent: "infra.server.device_model"}
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,code,name,vendor,model_number,form_factor,rack_units"}}}
};
