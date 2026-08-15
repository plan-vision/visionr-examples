module.exports = {
    icon: "person",
    properties: {
        "main.academics": {
            code: "code.unique",
            email: {
                template: "varchar",
                index: "eml"
            },
            courses: {
                template: "relation",
                parent: "courses.course.participants"
            }
        },
        "documents.basic": {
            documents: "documents.file_upload"
        }
    }
};
