#!/usr/bin/env vr run

function argument(name, fallback) {
    const index = VR.cli.args.indexOf("--" + name);
    if (index < 0) return fallback;
    if (index + 1 >= VR.cli.args.length)
        throw new Error("Missing value for --" + name);
    return VR.cli.args[index + 1];
}

function boundedInteger(name, value, minimum, maximum) {
    value = Number(value);
    if (!Number.isInteger(value) || value < minimum || value > maximum)
        throw new Error(name + " must be an integer from " + minimum + " to " + maximum);
    return value;
}

const profiles = {
    medium: {departments: 100, students: 10000, courses: 2000},
    large: {departments: 250, students: 50000, courses: 10000}
};
const profileName = String(argument("profile", "medium"));
if (!profiles[profileName])
    throw new Error("Unknown performance profile: " + profileName);
const profile = {
    name: profileName,
    departments: boundedInteger("departments", argument("departments", profiles[profileName].departments), 2, 1000),
    students: boundedInteger("students", argument("students", profiles[profileName].students), 100, 200000),
    courses: boundedInteger("courses", argument("courses", profiles[profileName].courses), 10, 50000),
    studentBatch: boundedInteger("student batch", argument("student-batch", 500), 50, 2000),
    courseBatch: boundedInteger("course batch", argument("course-batch", 40), 5, 200)
};

function batches(length, size) {
    const result = [];
    for (let start = 0; start < length; start += size)
        result.push({start, end: Math.min(length, start + size)});
    return result;
}

function expectedParticipants(courseIndex, studentCount) {
    if (courseIndex % 97 === 0) return 0;
    if (courseIndex % 31 === 0) return Math.min(studentCount, 250);
    return Math.min(studentCount, 40 + ((courseIndex * 17) % 41));
}

async function createDepartments() {
    return VR.srv.call(function(settings) {
        function pad(value, length) {
            value = String(value);
            while (value.length < length) value = "0" + value;
            return value;
        }
        var Department = db.courses.department;
        var existing = Department.COUNT({where: "code >= 'PERF-D-' AND code < 'PERF-D.'"});
        if (existing)
            throw new Error("Performance departments already exist; reset the development database before regenerating");
        var roots = Math.max(2, Math.min(20, Math.ceil(settings.departments / 10)));
        for (var index = 0; index < settings.departments; index++) {
            var value = new Department();
            value.code = "PERF-D-" + pad(index + 1, 4);
            value.name = "Performance department " + pad(index + 1, 4);
            value.color = "#" + ((index * 2654435761 >>> 8) & 0xffffff).toString(16).padStart(6, "0");
            if (index >= roots)
                value.parent = Department.byCode("PERF-D-" + pad((index % roots) + 1, 4));
            value.commit();
        }
        return {created: settings.departments, roots: roots};
    }, profile);
}

async function createStudentBatch(batch) {
    return VR.srv.call(function(settings, range) {
        function pad(value, length) {
            value = String(value);
            while (value.length < length) value = "0" + value;
            return value;
        }
        var Student = db.courses.student;
        for (var index = range.start; index < range.end; index++) {
            var value = new Student();
            value.code = "PERF-S-" + pad(index + 1, 6);
            value.name = "Performance student " + pad(index + 1, 6);
            value.email = "performance.student." + pad(index + 1, 6) + "@example.invalid";
            value.commit();
        }
        return {start: range.start, end: range.end, created: range.end - range.start};
    }, profile, batch);
}

async function createCourseBatch(batch) {
    return VR.srv.call(function(settings, range) {
        function pad(value, length) {
            value = String(value);
            while (value.length < length) value = "0" + value;
            return value;
        }
        function participantCount(index) {
            if (index % 97 === 0) return 0;
            if (index % 31 === 0) return Math.min(settings.students, 250);
            return Math.min(settings.students, 40 + ((index * 17) % 41));
        }
        var Course = db.courses.course;
        var Department = db.courses.department;
        var Student = db.courses.student;
        var Status = db.courses.course_status;
        var students = Student.SELECT({
            where: "code >= 'PERF-S-' AND code < 'PERF-S.'",
            orderBy: "code",
            limit: settings.students
        });
        if (students.length !== settings.students)
            throw new Error("Performance student working set is incomplete: " + students.length);
        var statuses = [Status.byCode("completed"), Status.byCode("in_progress"), Status.byCode("planned")];
        var modes = ["on_campus", "hybrid", "online"];
        var enrollments = 0;
        for (var index = range.start; index < range.end; index++) {
            var count = participantCount(index);
            var participants = [];
            var offset = (index * 131) % settings.students;
            for (var item = 0; item < count; item++)
                participants.push(students[(offset + item * 977) % settings.students]);
            var value = new Course();
            value.code = "PERF-C-" + pad(index + 1, 6);
            value.name = "Performance course " + pad(index + 1, 6);
            value.department = Department.byCode("PERF-D-" + pad((index % settings.departments) + 1, 4));
            value.status = statuses[index % statuses.length];
            value.credits = 3 + ((Math.floor(index / settings.departments) + index * 3) % 4);
            value.delivery_mode = modes[Math.floor(index / 7) % modes.length];
            value.requires_lab = index % 5 === 0;
            var begin = Date.UTC(2025 + (index % 3), index % 12, 1 + (index % 27), 6 + (index % 13), (index * 7) % 60, 0, 0);
            value.begin_time = new Date(begin);
            value.end_time = new Date(begin + (60 + (index % 4) * 30) * 60000);
            value.participants = participants;
            value.commit();
            enrollments += count;
        }
        return {start: range.start, end: range.end, created: range.end - range.start, enrollments: enrollments};
    }, profile, batch);
}

try {
    console.log("AI_SEARCH_PERFORMANCE_FIXTURE_START " + JSON.stringify(profile));
    const departmentResult = await createDepartments();
    let studentsCreated = 0;
    for (const batch of batches(profile.students, profile.studentBatch)) {
        const result = await createStudentBatch(batch);
        studentsCreated += result.created;
        console.log("AI_SEARCH_PERFORMANCE_STUDENTS " + result.end + "/" + profile.students);
    }
    let coursesCreated = 0;
    let enrollmentsCreated = 0;
    for (const batch of batches(profile.courses, profile.courseBatch)) {
        const result = await createCourseBatch(batch);
        coursesCreated += result.created;
        enrollmentsCreated += result.enrollments;
        console.log("AI_SEARCH_PERFORMANCE_COURSES " + result.end + "/" + profile.courses);
    }
    const verification = await VR.srv.call(function(settings) {
        var Department = db.courses.department;
        var Student = db.courses.student;
        var Course = db.courses.course;
        return {
            departments: Department.COUNT({where: "code >= 'PERF-D-' AND code < 'PERF-D.'"}),
            students: Student.COUNT({where: "code >= 'PERF-S-' AND code < 'PERF-S.'"}),
            courses: Course.COUNT({where: "code >= 'PERF-C-' AND code < 'PERF-C.'"})
        };
    }, profile);
    if (verification.departments !== profile.departments ||
        verification.students !== profile.students ||
        verification.courses !== profile.courses)
        throw new Error("Performance fixture verification failed: " + JSON.stringify(verification));
    const expectedEnrollments = Array.from({length: profile.courses}, (_, index) =>
        expectedParticipants(index, profile.students)).reduce((sum, value) => sum + value, 0);
    if (enrollmentsCreated !== expectedEnrollments)
        throw new Error("Performance enrollment count is not deterministic");
    console.log("AI_SEARCH_PERFORMANCE_FIXTURE_RESULT " + JSON.stringify({
        profile,
        departmentResult,
        studentsCreated,
        coursesCreated,
        enrollmentsCreated,
        verification
    }));
} finally {
    await VR.srv.stop();
}
