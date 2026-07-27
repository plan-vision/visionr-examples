module.exports = {
    icon: "dns",
    properties: {
        "main.location": {
            code: "code.unique",
            colocation: {template: "relation.obligatory", related: "infra.colocation"},
            row: "varchar",
            position: "varchar",
            height_units: {template: "integer.obligatory", unit: "U"},
            power_capacity_w: {template: "integer", unit: "W"},
            power_draw_w: {template: "integer", unit: "W"},
            status: {
                template: "relation.obligatory",
                related: "infra.lifecycle_status"
            },
            servers: {template: "relation", parent: "infra.server.rack"}
        },
        "documents.basic": {documents: "documents.file_upload"}
    },
    forms: {viewParams: {table: {columns: "icon,code,name,colocation,row,position,height_units,power_draw_w,power_capacity_w,status"}}},
    highlighting: {path: "status.color"}
};
