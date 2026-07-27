// Workbook participant row contract:
// Array<{ code: string, name: string, email: string }>

function text(value) {
    return value == null ? "" : String(value);
}

exports.getParticipantRows = function(course) {
    if (!course)
        return [];

    return Array.from(course.participants || []).map(function(student) {
        return {
            code: text(student.code),
            name: text(student.name),
            email: text(student.email)
        };
    });
};
