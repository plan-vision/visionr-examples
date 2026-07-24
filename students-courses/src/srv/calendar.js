// @allowRemote

const misc = require("server/misc");
const OBJREF = misc.OBJREF;
const OIMG_CLEAN = misc.OIMG_CLEAN;

function label(code) {
    const message = db.core.message.byCode(code);
    return message ? message.getI18nActive("name") : code;
}

function courseItem(course) {
    const name = misc.escapeHTML(course + "");
    const noDepartment = label("LABEL_COURSES_NO_DEPARTMENT");
    const creditsLabel = label("LABEL_COURSES_CREDITS");
    const department = misc.escapeHTML(
        course.department ? course.department + "" : noDepartment
    );
    const credits = course.credits == null ? "-" : course.credits;
    const participantCount = course.count("participants");
    const participantLabel = participantCount + " " + label(
        participantCount === 1
            ? "LABEL_COURSES_PARTICIPANT"
            : "LABEL_COURSES_PARTICIPANTS"
    );
    const itemBackground = course.status && course.status.color;

    return {
        id: course.id,
        object: OBJREF(course),
        start: course.begin_time,
        end: course.end_time,
        NAME: course + "",
        DEPARTMENT: course.department ? course.department + "" : noDepartment,
        CREDITS: credits,
        PARTICIPANT_COUNT: participantCount,
        PARTICIPANTS: participantLabel,
        STATUS: course.status ? course.status + "" : "",
        DETAILS: (course + "") + " - " + department + " - " +
            credits + " " + creditsLabel + " - " + participantLabel,
        style: itemBackground
            ? "background-color:" + itemBackground
            : undefined,
        content:
            "<div style='line-height:1.25'>" +
                "<strong>" + name + "</strong>" +
                "<div>" + department + " - " + credits + " " +
                    misc.escapeHTML(creditsLabel) + "</div>" +
                "<div>" + participantLabel + "</div>" +
            "</div>"
    };
}

exports.course = function(value) {
    if (value instanceof db.courses.course)
        return courseItem(value);
};

exports.courseAndDepartment = function(value) {
    if (value instanceof db.courses.course)
        return courseItem(value);

    if (value instanceof db.courses.department) {
        return {
            object: OBJREF(value),
            CODE: value.code,
            NAME: value + "",
            ICON: OIMG_CLEAN(value, 96, 96)
        };
    }
};
