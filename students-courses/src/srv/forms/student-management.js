const forms = require("server/forms");

forms.define({
    "courses.department": {
        view: "table",
        viewParams: {
            table: {
                columns: "icon,code,name@300,parent,courses"
            }
        },
        hierarchy: "courses.department.children",
        hierarchies: [{
            code: "courses.department.children",
            path: "children",
            nameI18n: "LABEL_COURSES_DEPARTMENTS",
            count: true,
            leafs: true,
            expandInitialDepth: 3,
            schemaSet: ["courses.department"],
            setupNew: {
                remote: "courses/hierarchy.remote",
                api: "setupNewDepartment"
            }
        }],
        orderBy: "name"
    },
    "courses.student": {
        view: "table",
        viewParams: {
            table: {
                columns: "icon,code,name@300,email,courses"
            },
            overview: {
                templateAdditional: {
                    ref: "/widgets/courses/student/participation-calendar"
                }
            }
        },
        orderBy: "name"
    },
    "courses.course_status": {
        view: "table",
        viewParams: {
            table: {
                columns: "icon,code,name@300,color"
            }
        },
        orderBy: "name"
    },
    "courses.course": {
        view: "table",
        viewParams: {
            table: {
                columns: "icon,code,name@300,status,department,credits,begin_time,end_time,participants"
            }
        },
        checkConstraints: function(details) {
            const course = details.object;
            if (course.begin_time && course.end_time && course.begin_time >= course.end_time) {
                const translated = db.core.message.byCode(
                    "ERROR_COURSES_BEGIN_BEFORE_END"
                );
                return [{
                    message: translated
                        ? translated.getI18nActive("name")
                        : "ERROR_COURSES_BEGIN_BEFORE_END",
                    type: "error",
                    key: "begin_time_before_end_time",
                    path: "begin_time"
                }];
            }
        },
        hierarchy: "courses.course.by_department",
        hierarchies: [{
            code: "courses.course.by_department",
            path: "courses.department[WHERE parent.id IS NULL].children*.courses",
            nameI18n: "LABEL_COURSES_COURSES_BY_DEPARTMENT",
            count: true,
            expandInitialDepth: 3,
            schemaSet: ["courses.department", "courses.course"],
            setupNew: {
                remote: "courses/hierarchy.remote",
                api: "setupNewCourseHierarchy"
            }
        }],
        orderBy: "name"
    }
});
