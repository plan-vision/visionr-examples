function program(clauses, counts) {
    return {
        strategy: "condition",
        root: "root",
        blocks: [{
            id: "root",
            join: "and",
            clauses: clauses || [],
            counts: counts || [],
            children: []
        }]
    };
}

var corpus = {
    version: 1,
    name: "students-courses AI search acceptance",
    thresholds: {
        exactMatchRate: 0.90,
        criticalExactMatchRate: 1.0,
        maximumInvalidRate: 0.05,
        maximumHighRiskPlans: 0
    },
    cases: [
        {
            id: "course.by-code",
            schema: "courses.course",
            tags: ["scalar", "exact", "critical"],
            prompts: {
                "en-US": "course with code ALG-201",
                "de-DE": "Kurs mit dem Code ALG-201"
            },
            program: program([{path: "code", operator: "equals", value: "ALG-201"}]),
            expectedCodes: ["ALG-201"]
        },
        {
            id: "course.completed",
            schema: "courses.course",
            tags: ["relation", "localized"],
            prompts: {
                "en-US": "completed courses",
                "de-DE": "abgeschlossene Kurse"
            },
            program: program([{path: "status.code", operator: "equals", value: "completed"}]),
            expectedCodes: ["ADM-301", "ALG-330", "CHEM-320", "CS-150", "DS-230", "DS-410", "MATH-130", "PHYS-101"]
        },
        {
            id: "course.maximum-credits",
            schema: "courses.course",
            tags: ["aggregate", "global", "critical"],
            prompts: {
                "en-US": "courses having the maximum number of credits",
                "de-DE": "Kurse mit der maximalen Anzahl an Leistungspunkten"
            },
            program: program([{
                path: "credits",
                operator: "equals",
                aggregate: {function: "max", path: "credits"}
            }]),
            expectedCodes: ["ADM-301", "AI-250", "AI-401", "AI-420", "ALG-330", "CS-440", "DS-360", "DS-410", "PHYS-350", "SE-430", "STAT-320", "STAT-450"]
        },
        {
            id: "course.maximum-credits-per-department",
            schema: "courses.course",
            tags: ["aggregate", "grouped", "relation", "critical"],
            prompts: {
                "en-US": "the highest-credit courses in each department",
                "de-DE": "die Kurse mit den meisten Leistungspunkten je Fachbereich"
            },
            program: program([{
                path: "credits",
                operator: "equals",
                aggregate: {function: "max", path: "credits", groupBy: "department.code"}
            }]),
            expectedCodes: ["ADM-301", "AI-250", "AI-401", "AI-420", "ALG-330", "BIO-440", "CHEM-240", "CHEM-320", "CS-440", "DS-360", "DS-410", "MATH-130", "MATH-210", "MATH-410", "PHYS-350", "SE-430", "STAT-320", "STAT-450"]
        },
        {
            id: "course.above-average-credits",
            schema: "courses.course",
            tags: ["aggregate", "average", "number", "critical"],
            prompts: {
                "en-US": "courses with more credits than the average course",
                "de-DE": "Kurse mit mehr Leistungspunkten als der Durchschnitt"
            },
            program: program([{
                path: "credits",
                operator: "greater_than",
                aggregate: {function: "avg", path: "credits"}
            }]),
            expectedCodes: ["ADM-301", "AI-250", "AI-401", "AI-420", "ALG-330", "CS-440", "DS-360", "DS-410", "PHYS-350", "SE-430", "STAT-320", "STAT-450"]
        },
        {
            id: "course.planned-ai-five-credits",
            schema: "courses.course",
            tags: ["and", "relation", "number"],
            prompts: {
                "en-US": "planned AI department courses with at least five credits",
                "de-DE": "geplante Kurse des KI-Fachbereichs mit mindestens fünf Leistungspunkten"
            },
            program: program([
                {path: "department.code", operator: "equals", value: "AI"},
                {path: "status.code", operator: "equals", value: "planned"},
                {path: "credits", operator: "greater_or_equal", value: 5}
            ]),
            expectedCodes: ["AI-250", "AI-401", "AI-420"]
        },
        {
            id: "course.hybrid",
            schema: "courses.course",
            tags: ["option", "critical"],
            prompts: {
                "en-US": "hybrid courses",
                "de-DE": "hybride Kurse"
            },
            program: program([{path: "delivery_mode", operator: "equals", value: "hybrid"}]),
            expectedCodes: ["AI-250", "AI-401", "AI-420", "DS-230", "DS-360", "DS-410", "STAT-320", "STAT-340", "STAT-450"]
        },
        {
            id: "course.requires-lab",
            schema: "courses.course",
            tags: ["boolean", "critical"],
            prompts: {
                "en-US": "courses that require a laboratory",
                "de-DE": "Kurse, die ein Labor benötigen"
            },
            program: program([{path: "requires_lab", operator: "equals", value: true}]),
            expectedCodes: ["BIO-120", "BIO-205", "BIO-315", "BIO-440", "CHEM-110", "CHEM-240", "CHEM-320", "PHYS-101", "PHYS-220", "PHYS-350"]
        },
        {
            id: "course.no-participants",
            schema: "courses.course",
            tags: ["count", "zero", "absence", "critical"],
            prompts: {
                "en-US": "courses with no participants",
                "de-DE": "Kurse ohne Teilnehmende"
            },
            program: program([], [{scope: "participants", operator: "equals", value: 0}]),
            expectedCodes: ["OPEN-000"]
        },
        {
            id: "course.six-participants",
            schema: "courses.course",
            tags: ["count", "relation", "critical"],
            prompts: {
                "en-US": "courses with at least six participants",
                "de-DE": "Kurse mit mindestens sechs Teilnehmenden"
            },
            program: program([], [{scope: "participants", operator: "greater_or_equal", value: 6}]),
            expectedCodes: ["AI-420", "ALG-330", "STAT-450"]
        },
        {
            id: "course.august-2026",
            schema: "courses.course",
            tags: ["datetime", "range", "timezone"],
            prompts: {
                "en-US": "courses beginning in August 2026",
                "de-DE": "Kurse, die im August 2026 beginnen"
            },
            program: program([{
                path: "begin_time",
                operator: "between",
                values: ["2026-08-01", "2026-08-31"]
            }]),
            expectedCodes: ["AI-250", "CHEM-240", "DS-230", "SE-260"]
        },
        {
            id: "course.online-planned",
            schema: "courses.course",
            tags: ["option", "relation", "and"],
            prompts: {
                "en-US": "planned online courses",
                "de-DE": "geplante Online-Kurse"
            },
            program: program([
                {path: "delivery_mode", operator: "equals", value: "online"},
                {path: "status.code", operator: "equals", value: "planned"}
            ]),
            expectedCodes: ["CS-440", "SE-310", "SE-430"]
        },
        {
            id: "course.at-most-five-literal",
            schema: "courses.course",
            tags: ["number", "literal-vs-aggregate", "critical"],
            prompts: {
                "en-US": "courses with at most five credits",
                "de-DE": "Kurse mit höchstens fünf Leistungspunkten"
            },
            program: program([{path: "credits", operator: "less_or_equal", value: 5}]),
            expectedCodes: ["ALG-201", "BIO-120", "BIO-205", "BIO-315", "BIO-440", "CHEM-110", "CHEM-240", "CHEM-320", "CS-150", "DS-230", "MATH-130", "MATH-210", "MATH-410", "OPEN-000", "PHYS-101", "PHYS-220", "SE-260", "SE-310", "STAT-340"]
        },
        {
            id: "student.no-courses",
            schema: "courses.student",
            tags: ["count", "zero", "absence", "critical"],
            prompts: {
                "en-US": "students enrolled in no courses",
                "de-DE": "Studierende ohne Kursbelegung"
            },
            program: program([], [{scope: "courses", operator: "equals", value: 0}]),
            expectedCodes: ["STU-021"]
        },
        {
            id: "student.at-least-six-courses",
            schema: "courses.student",
            tags: ["count", "relation"],
            prompts: {
                "en-US": "students participating in at least six courses",
                "de-DE": "Studierende, die an mindestens sechs Kursen teilnehmen"
            },
            program: program([], [{scope: "courses", operator: "greater_or_equal", value: 6}]),
            expectedCodes: ["STU-001", "STU-002", "STU-003", "STU-004", "STU-005", "STU-006", "STU-007", "STU-008", "STU-010", "STU-011", "STU-014", "STU-020"]
        },
        {
            id: "student.no-completed-course",
            schema: "courses.student",
            tags: ["none", "absence", "nested-relation", "critical"],
            prompts: {
                "en-US": "students who are not in any completed course",
                "de-DE": "Studierende, die an keinem abgeschlossenen Kurs teilnehmen"
            },
            program: program([{
                path: "courses.status.code",
                operator: "equals",
                value: "completed",
                quantifier: "none"
            }]),
            expectedCodes: ["STU-003", "STU-004", "STU-008", "STU-009", "STU-015", "STU-017", "STU-019", "STU-021"]
        },
        {
            id: "student.all-courses-planned",
            schema: "courses.student",
            tags: ["all", "nonempty", "nested-relation", "critical"],
            prompts: {
                "en-US": "enrolled students whose courses are all planned",
                "de-DE": "eingeschriebene Studierende, deren Kurse alle geplant sind"
            },
            program: program([{
                path: "courses.status.code",
                operator: "equals",
                value: "planned",
                quantifier: "all_nonempty"
            }]),
            expectedCodes: ["STU-015"]
        },
        {
            id: "student.in-six-credit-course",
            schema: "courses.student",
            tags: ["any", "relation", "number"],
            prompts: {
                "en-US": "students in a six-credit course",
                "de-DE": "Studierende in einem Kurs mit sechs Leistungspunkten"
            },
            program: program([{
                path: "courses.credits",
                operator: "equals",
                value: 6,
                quantifier: "any"
            }]),
            expectedCodes: ["STU-001", "STU-002", "STU-003", "STU-004", "STU-005", "STU-006", "STU-007", "STU-008", "STU-009", "STU-010", "STU-011", "STU-012", "STU-014", "STU-015", "STU-016", "STU-018", "STU-019", "STU-020"]
        },
        {
            id: "student.two-completed-courses",
            schema: "courses.student",
            tags: ["count", "filtered-count", "nested-relation", "critical"],
            prompts: {
                "en-US": "students participating in at least two completed courses",
                "de-DE": "Studierende, die an mindestens zwei abgeschlossenen Kursen teilnehmen"
            },
            program: program([], [{
                scope: "courses",
                operator: "greater_or_equal",
                value: 2,
                where: {
                    join: "and",
                    clauses: [{path: "courses.status.code", operator: "equals", value: "completed"}]
                }
            }]),
            expectedCodes: ["STU-001", "STU-002", "STU-005", "STU-006", "STU-007", "STU-010", "STU-011", "STU-012", "STU-013", "STU-014", "STU-018", "STU-020"]
        },
        {
            id: "department.at-least-four-courses",
            schema: "courses.department",
            tags: ["count", "reverse-relation", "critical"],
            prompts: {
                "en-US": "departments offering at least four courses",
                "de-DE": "Fachbereiche mit mindestens vier Kursen"
            },
            program: program([], [{scope: "courses", operator: "greater_or_equal", value: 4}]),
            expectedCodes: ["BIO", "CS", "DS"]
        },
        {
            id: "department.no-direct-courses",
            schema: "courses.department",
            tags: ["count", "zero", "hierarchy", "critical"],
            prompts: {
                "en-US": "departments with no directly assigned courses",
                "de-DE": "Fachbereiche ohne direkt zugeordnete Kurse"
            },
            program: program([], [{scope: "courses", operator: "equals", value: 0}]),
            expectedCodes: ["SCI"]
        },
        {
            id: "department.no-completed-courses",
            schema: "courses.department",
            tags: ["none", "reverse-relation", "nested-relation"],
            prompts: {
                "en-US": "departments without any completed course",
                "de-DE": "Fachbereiche ohne abgeschlossenen Kurs"
            },
            program: program([{
                path: "courses.status.code",
                operator: "equals",
                value: "completed",
                quantifier: "none"
            }]),
            expectedCodes: ["AI", "BIO", "SCI", "SE", "STAT"]
        }
    ]
};

// Keep the exact semantic corpus stable when the optional PERF-* scale fixture
// is installed. This is also the acceptance scope propagated through reflection,
// aggregate population, EXPLAIN, and final result execution.
for (var entry of corpus.cases)
    entry.scopeCondition = "code < 'PERF-' OR code >= 'PERF.'";

module.exports = corpus;
