#!/usr/bin/env vr run

try {
    const result = await VR.srv.call(function() {
        const Department = db.courses.department;
        const Student = db.courses.student;
        const CourseStatus = db.courses.course_status;
        const Course = db.courses.course;
        const appliedDataModeling = Course.byCode("ADM-301");

        return {
            departmentCount: Department.COUNT(),
            studentCount: Student.COUNT(),
            courseStatusCount: CourseStatus.COUNT(),
            courseCount: Course.COUNT(),
            appliedDataModeling:
                appliedDataModeling && String(appliedDataModeling.name),
            appliedDataModelingStatus:
                appliedDataModeling && String(appliedDataModeling.status),
            appliedDataModelingParticipants:
                appliedDataModeling && appliedDataModeling.count("participants"),
            dataScienceParent:
                String(Department.byCode("DS").parent)
        };
    });

    console.log("PROJECT_VERIFY_RESULT " + JSON.stringify(result));

    if (result.departmentCount !== 10 ||
        result.studentCount !== 20 ||
        result.courseStatusCount !== 3 ||
        result.courseCount !== 30 ||
        result.appliedDataModeling !== "Applied Data Modeling" ||
        result.appliedDataModelingStatus !== "Completed" ||
        result.appliedDataModelingParticipants !== 2 ||
        result.dataScienceParent !== "Computer Science") {
        throw new Error("Imported schema or sample data is invalid: " +
            JSON.stringify(result));
    }
} finally {
    await VR.srv.stop();
}
