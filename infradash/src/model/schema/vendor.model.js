module.exports = {
    icon: "factory",
    properties: {
        "main.catalog": {
            code: "code.unique",
            website: "varchar",
            support_email: "varchar",
            models: {template: "relation", parent: "infra.device_model.vendor"}
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,code,name,website,support_email"}}}
};
