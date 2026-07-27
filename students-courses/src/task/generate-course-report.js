#!/usr/bin/env vr run

try {
    const result = await VR.srv.call(function() {
        const reports = require("server/reports");
        const report = db.reports.report_xls.byCode(
            "courses.course-participants"
        );

        if (!report)
            throw new Error("Course participant report definition is missing.");
        if (!report.data_file)
            throw new Error("Course participant report template is missing.");
        if (!report.data_file.current_version)
            throw new Error("Course participant report version is missing.");
        if (!report.data_file.current_version.resource)
            throw new Error("Course participant report resource is missing.");

        const generated = reports.getReportDirect({
            report: "courses.course-participants",
            schema: "courses.course",
            condition: "code IN ('ADM-301','AI-401')",
            orderBy: "code",
            queryParams: null,
            param: null,
            format: "XLSX",
            forceUpdate: true
        });

        if (generated.error)
            throw new Error(generated.error);
        if (!generated.result)
            throw new Error("The report engine did not return a document.");

        return {
            schema: generated.result.SCHEMA,
            code: generated.result.code,
            name: String(generated.result.name || ""),
            url: generated.result.get_content_url()
        };
    });

    console.log("COURSE_REPORT_RESULT " + JSON.stringify(result));
} finally {
    await VR.srv.stop();
}
