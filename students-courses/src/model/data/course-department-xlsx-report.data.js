const template = vr.defineDocument({
    code: "courses-by-department-xlsx-template",
    source: "share/documents/courses/reports/courses-by-department.xlsx",
    folder: "/courses/reports",
    folderName: {
        "en-US": "Course reports",
        "de-DE": "Kursberichte"
    },
    schema: "documents.file",
    name: {
        "en-US": "Courses by department XLSX template",
        "de-DE": "XLSX-Vorlage Kurse nach Abteilung"
    },
    version: "1.0",
    access: {
        read: "logged_users",
        owner: "administrators",
        mutate: "administrators"
    }
});

const rowsScript = {
    SCHEMA: "core.jscript",
    code: "courses.department-report:get_department_chart_rows"
};

vr.defineObject({
    ...rowsScript,
    values: {
        name: {
            "en-US": "Prepare department chart rows",
            "de-DE": "Abteilungsdiagrammzeilen vorbereiten"
        },
        params: [{
            SCHEMA: "core.script_param",
            code: "selection"
        }],
        script_code:
            "return require('courses/reports')" +
            ".getDepartmentChartRows(selection);"
    }
}, {
    params: "replace"
});

vr.defineObject({
    SCHEMA: "reports.report_xls",
    code: "courses.courses-by-department-xlsx",
    values: {
        name: {
            "en-US": "Courses by department (XLSX)",
            "de-DE": "Kurse nach Abteilung (XLSX)"
        },
        description: {
            "en-US": "Native Excel pie chart of direct course counts by department.",
            "de-DE": "Natives Excel-Kreisdiagramm der direkten Kursanzahl nach Abteilung."
        },
        objectdef_set: [{
            SCHEMA: "core.objectdef",
            cond: "module.code='courses' AND code='course'"
        }, {
            SCHEMA: "core.objectdef",
            cond: "module.code='courses' AND code='department'"
        }],
        status: {
            SCHEMA: "reports.status_report_definition",
            code: "active"
        },
        format: {
            SCHEMA: "documents.extension",
            mode: "lookup",
            code: "XLSX"
        },
        output_extension: {
            SCHEMA: "documents.extension",
            mode: "lookup",
            code: "XLSX"
        },
        data_file: template,
        scripts: [rowsScript],
        is_single_page: false,
        is_selection_sensitive: true,
        is_selection_obligatory: false,
        is_remote_access_by_code: true
    }
}, {
    objectdef_set: "replace",
    scripts: "replace"
});
