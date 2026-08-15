module.exports = {
    icon: "account_tree",
    properties: {
        "main.academics": {
            code: "code.unique",
            color: "varchar.color",
            parent: {
                template: "relation",
                related: "courses.department",
                index: "par"
            },
            children: {
                template: "relation",
                parent: "courses.department.parent"
            },
            courses: {
                template: "relation",
                parent: "courses.course.department"
            }
        },
        "documents.basic": {
            documents: "documents.file_upload"
        }
    }
};
