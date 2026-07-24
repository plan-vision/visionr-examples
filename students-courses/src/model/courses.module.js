vr.defineI18n(require("./courses.i18n.json"));

vr.defineModule("courses", {
    alias: "courses",
    objectdefs: {
        department: require("./schema/department"),
        student: require("./schema/student"),
        course_status: require("./schema/course_status"),
        course: require("./schema/course")
    },
    version: "0.0001"
});

require("./data/department-icons.data");
require("./data/academics.data");
