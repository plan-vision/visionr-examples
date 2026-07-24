module.exports = {
    icon: "school",
    properties: {
        "main.academics": {
            code: "code.unique",
            department: {
                template: "relation.obligatory",
                related: "courses.department"
            },
            status: {
                template: "relation.obligatory",
                related: "courses.course_status"
            },
            credits: "integer.obligatory",
            begin_time: {
                template: "datetime.obligatory",
                format: "datetime_hour_minutes"
            },
            end_time: {
                template: "datetime.obligatory",
                format: "datetime_hour_minutes"
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
