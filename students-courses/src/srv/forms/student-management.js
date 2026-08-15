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
        searchAI: function(details) {
            return {
                guidance: "This is the student directory. Prefer exact email/code filters and " +
                    "case-insensitive name containment. Course participation may be combined " +
                    "with student fields when its reflected path is available. Seeded-data " +
                    "acceptance examples include: students whose email contains a domain, " +
                    "students participating in a named course, and names containing a phrase. " +
                    "The current context exposes " + details.searchAI.properties.length +
                    " reflected search properties."
            };
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
                columns: "icon,code,name@300,status,department,credits,delivery_mode,requires_lab,begin_time,end_time,participants"
            }
        },
        searchAI: function(details) {
            return {
                guidance: "This is the seeded course catalog. Interpret status names through " +
                    "the reflected status relation, department names/codes through department, " +
                    "credits as a number, delivery mode through its reflected option code, " +
                    "laboratory requirement as a boolean, and begin/end values as ISO dates or datetimes. " +
                    "Prefer a direct condition. Seeded-data acceptance examples include: " +
                    "planned AI-department courses with at least 5 credits, completed courses, " +
                    "and courses beginning within a requested date range. The current context " +
                    "exposes " + details.searchAI.properties.length + " reflected search properties."
            };
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
