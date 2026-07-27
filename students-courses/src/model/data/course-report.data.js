const courseReportTemplate = vr.defineDocument({
    code: "course-participants-report-template",
    source: "share/documents/courses/reports/course-participants.xlsx",
    folder: "/courses/reports",
    folderName: {
        "en-US": "Course reports",
        "de-DE": "Kursberichte"
    },
    schema: "documents.file",
    name: {
        "en-US": "Course participant report template",
        "de-DE": "Vorlage fuer Kursteilnehmerbericht"
    },
    version: "1.0",
    access: {
        read: "logged_users",
        owner: "administrators",
        mutate: "administrators"
    }
});

const participantRowsScript = {
    SCHEMA: "core.jscript",
    code: "courses.course-report:get_participant_rows"
};

vr.defineObject({
    ...participantRowsScript,
    values: {
        name: {
            "en-US": "Prepare course participant rows",
            "de-DE": "Kursteilnehmerzeilen vorbereiten"
        },
        params: [{
            SCHEMA: "core.script_param",
            code: "course"
        }],
        script_code:
            "return require('courses/course-report')" +
            ".getParticipantRows(course);"
    }
}, {
    params: "replace"
});

vr.defineObject({
    SCHEMA: "reports.report_xls",
    code: "courses.course-participants",
    values: {
        name: {
            "en-US": "Course participants",
            "de-DE": "Kursteilnehmer"
        },
        description: {
            "en-US": "Course participant list for the selected courses.",
            "de-DE": "Kursteilnehmerliste fuer die ausgewaehlten Kurse."
        },
        objectdef_set: [{
            SCHEMA: "core.objectdef",
            cond: "module.code='courses' AND code='course'"
        }],
        format: {
            SCHEMA: "documents.extension",
            code: "XLSX"
        },
        output_extension: {
            SCHEMA: "documents.extension",
            code: "XLSX"
        },
        data_file: courseReportTemplate,
        scripts: [participantRowsScript],
        is_single_page: true,
        is_selection_sensitive: true,
        is_selection_obligatory: true,
        is_remote_access_by_code: true
    }
}, {
    objectdef_set: "replace",
    scripts: "replace"
});
