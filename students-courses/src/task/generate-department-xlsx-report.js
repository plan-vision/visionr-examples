#!/usr/bin/env vr run

try {
    const result = await VR.srv.call(function() {
        const distribution = require("courses/reports")
            .getDepartmentDistribution(null, null);
        const groupedCourseCount = distribution.rows.reduce(
            function(total, row) {
                return total + row.value;
            },
            0
        );

        if (!distribution.rows.length)
            throw new Error("Department aggregation returned no rows.");
        if (groupedCourseCount !== db.courses.course.COUNT())
            throw new Error(
                "Department aggregation does not cover all courses."
            );

        const generated = require("server/reports").getReportDirect({
            report: "courses.courses-by-department-xlsx",
            schema: "courses.course",
            condition: null,
            orderBy: null,
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
            uuid: generated.result.uuid,
            courseCount: groupedCourseCount,
            departmentCount: distribution.rows.length
        };
    });

    console.log("DEPARTMENT_XLSX_REPORT_RESULT " + JSON.stringify(result));
} finally {
    await VR.srv.stop();
}
