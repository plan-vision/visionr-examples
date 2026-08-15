module.exports = {
    icon: "school",
    properties: {
        "main.academics": {
            code: "code.unique",
            department: {
                template: "relation.obligatory",
                related: "courses.department",
                index: "dep"
            },
            status: {
                template: "relation.obligatory",
                related: "courses.course_status",
                index: "sta",
                default: {
                    SCHEMA: "courses.course_status",
                    code: "in_progress"
                }
            },
            credits: {
                template: "integer.obligatory",
                index: "cre"
            },
            delivery_mode: {
                template: "option.obligatory",
                index: "dlv",
                optionSet: {
                    code: "course_delivery_mode",
                    options: ["on_campus", "hybrid", "online"]
                }
            },
            requires_lab: {
                template: "boolean.obligatory.default.false",
                index: "lab"
            },
            begin_time: {
                template: "datetime.obligatory",
                format: "datetime_hour_minutes",
                index: "btm"
            },
            end_time: {
                template: "datetime.obligatory",
                format: "datetime_hour_minutes",
                index: "etm"
            },
            participants: {
                template: "relation.multiple",
                related: "courses.student"
            }
        },
        "documents.basic": {
            documents: "documents.file_upload"
        }
    },
    highlighting: {
        path: "status.color"
    }
};
