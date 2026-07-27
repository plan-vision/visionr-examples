// @allowRemote

function checkUpdatable(object, schema) {
    if (!(object instanceof schema) || !object.ACCESS.updatable)
        throw new Error(db.MSG("ACCESS_DENIED"));
}

function selectedDepartment(paths) {
    if (!paths || paths.length !== 1)
        return;

    const path = paths[0];
    for (let i = path.length - 1; i >= 0; i--) {
        if (path[i] instanceof db.courses.department)
            return path[i];
    }
}

exports.setupNewDepartment = function(object, paths) {
    checkUpdatable(object, db.courses.department);

    const parent = selectedDepartment(paths);
    if (parent)
        object.parent = parent;
};

exports.setupNewCourseHierarchy = function(object, paths) {
    const department = selectedDepartment(paths);

    if (object instanceof db.courses.course) {
        checkUpdatable(object, db.courses.course);
        if (department)
            object.department = department;
        return;
    }

    if (object instanceof db.courses.department) {
        checkUpdatable(object, db.courses.department);
        if (department)
            object.parent = department;
        return;
    }

    throw new Error(db.MSG("ACCESS_DENIED"));
};
