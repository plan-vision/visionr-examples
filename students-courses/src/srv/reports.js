// @allowRemote

const misc = require("server/misc");
const color = require("server/color");

function opaqueChartColor(value, fallback) {
    const parsed = color.parse(value || fallback);
    return `rgb(${parsed.rgba[0]},${parsed.rgba[1]},${parsed.rgba[2]})`;
}

function queryOptions(condition, queryParams) {
    return {
        where: condition,
        ...(queryParams || {})
    };
}

function resolveObjectsById(schema, rows, column) {
    const ids = Array.from(new Set(rows.map(function(row) {
        return row[column];
    }).filter(function(id) {
        return id != null;
    })));
    const params = {};
    const placeholders = ids.map(function(id, index) {
        const key = "GROUP_" + index;
        params[key] = id;
        return ":" + key;
    });
    const objects = ids.length
        ? schema.SELECT({
            ...params,
            where: "id IN (" + placeholders.join(",") + ")"
        })
        : [];
    return new Map(objects.map(function(object) {
        return [object.id, object];
    }));
}

exports.getStatusDistribution = function(condition, queryParams) {
    const rows = db.courses.course.VSQL({
        select: "status,COUNT(id)",
        groupBy: "status",
        orderBy: "status.id",
        ...queryOptions(condition, queryParams)
    });
    const statusesById = resolveObjectsById(db.courses.course_status, rows, 0);

    return {
        count: rows.reduce(function(total, row) {
            return total + (row[1] || 0);
        }, 0),
        pie: rows.map(function(row) {
            const status = statusesById.get(row[0]);
            const value = row[1] || 0;
            return {
                object: status ? misc.OBJREF(status) : undefined,
                label: status ? status.toString() : "Without status",
                value: value,
                text: misc.formatDoubleDigitsTrim(value, 2),
                color: opaqueChartColor(status && status.color, "rgb(204,204,204)")
            };
        })
    };
};

exports.getDepartmentDistribution = function(condition, queryParams) {
    const rows = db.courses.course.VSQL({
        select: "department,COUNT(id)",
        groupBy: "department",
        orderBy: "department.id",
        ...queryOptions(condition, queryParams)
    });
    const departmentsById = resolveObjectsById(db.courses.department, rows, 0);

    return {
        rows: rows.map(function(row) {
            const department = departmentsById.get(row[0]);
            return {
                name: department ? department.toString() : "Without department",
                value: row[1] || 0,
                extra: {
                    object: department ? misc.OBJREF(department) : undefined
                }
            };
        }),
        colors: rows.filter(function(row) {
            const department = departmentsById.get(row[0]);
            return !!(department && department.color);
        }).map(function(row) {
            const department = departmentsById.get(row[0]);
            return {
                name: department.toString(),
                value: department.color
            };
        })
    };
};

exports.getDepartmentChartRows = function(selection) {
    const objects = selection == null
        ? []
        : (Array.isArray(selection) ? selection : Array.from(selection));
    const departments = objects.filter(function(object) {
        return object instanceof db.courses.department;
    });
    const courses = objects.filter(function(object) {
        return object instanceof db.courses.course;
    });
    const params = {};
    let condition = null;

    if (departments.length) {
        const placeholders = departments.map(function(department, index) {
            const key = "DEPARTMENT_" + index;
            params[key] = department.id;
            return ":" + key;
        });
        condition = "department.id IN (" + placeholders.join(",") + ")";
    } else if (courses.length) {
        const placeholders = courses.map(function(course, index) {
            const key = "COURSE_" + index;
            params[key] = course.id;
            return ":" + key;
        });
        condition = "id IN (" + placeholders.join(",") + ")";
    }

    return exports.getDepartmentDistribution(condition, params).rows.map(function(row) {
        return {
            name: row.name,
            count: row.value
        };
    });
};

exports.getParticipantLoad = function(condition, queryParams) {
    const rows = db.courses.course.VSQL({
        select: "id,COUNT(participants.id)",
        groupBy: "id",
        orderBy: "COUNT(participants.id) DESC,id",
        ...queryOptions(condition, queryParams)
    });
    const coursesById = resolveObjectsById(db.courses.course, rows, 0);

    return {
        rows: rows.map(function(row) {
            const course = coursesById.get(row[0]);
            return {
                name: course ? course.toString() : "—",
                value: row[1] || 0,
                extra: {
                    object: course ? misc.OBJREF(course) : undefined
                }
            };
        }),
        colors: rows.filter(function(row) {
            const course = coursesById.get(row[0]);
            return !!(course && course.status && course.status.color);
        }).map(function(row) {
            const course = coursesById.get(row[0]);
            return {
                name: course.toString(),
                value: opaqueChartColor(course.status.color, "rgb(204,204,204)")
            };
        })
    };
};
