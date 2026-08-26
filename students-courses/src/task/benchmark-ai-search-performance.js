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

const settings = {
    warmups: boundedInteger("warmups", argument("warmups", 2), 0, 10),
    iterations: boundedInteger("iterations", argument("iterations", 7), 1, 30),
    maximumP95Milliseconds: boundedInteger("maximum p95 milliseconds", argument("maximum-p95-ms", 5000), 100, 60000),
    verbose: "true" === String(argument("verbose", false)).toLowerCase()
};

function program(clauses, counts) {
    return {
        strategy: "condition",
        root: "root",
        blocks: [{
            id: "root", join: "and", clauses: clauses || [],
            counts: counts || [], children: []
        }]
    };
}

const cases = [
    {
        id: "course.maximum-credits.scoped",
        schema: "courses.course",
        prompt: "performance courses having the maximum number of credits",
        paths: ["credits"],
        program: program([{path: "credits", operator: "equals", aggregate: {function: "max", path: "credits"}}])
    },
    {
        id: "course.maximum-credits-per-department.scoped",
        schema: "courses.course",
        prompt: "highest-credit performance courses in each department",
        paths: ["credits", "department.code"],
        program: program([{path: "credits", operator: "equals", aggregate: {function: "max", path: "credits", groupBy: "department.code"}}])
    },
    {
        id: "course.no-participants.scoped",
        schema: "courses.course",
        prompt: "performance courses with no participants",
        paths: ["participants.code"],
        program: program([], [{scope: "participants", operator: "equals", value: 0}])
    },
    {
        id: "course.hot-enrollment.scoped",
        schema: "courses.course",
        prompt: "performance courses with at least two hundred participants",
        paths: ["participants.code"],
        program: program([], [{scope: "participants", operator: "greater_or_equal", value: 200}])
    },
    {
        id: "course.multi-property.scoped",
        schema: "courses.course",
        prompt: "planned hybrid performance courses with at least five credits that require a laboratory",
        paths: ["status.code", "delivery_mode", "credits", "requires_lab"],
        program: program([
            {path: "status.code", operator: "equals", value: "planned"},
            {path: "delivery_mode", operator: "equals", value: "hybrid"},
            {path: "credits", operator: "greater_or_equal", value: 5},
            {path: "requires_lab", operator: "equals", value: true}
        ])
    },
    {
        id: "course.datetime-range.scoped",
        schema: "courses.course",
        prompt: "performance courses beginning in August 2026",
        paths: ["begin_time"],
        program: program([{path: "begin_time", operator: "between", values: ["2026-08-01", "2026-08-31"]}])
    },
    {
        id: "student.any-six-credit-course.scoped",
        schema: "courses.student",
        prompt: "performance students in a six-credit course",
        paths: ["courses.credits"],
        program: program([{path: "courses.credits", operator: "equals", value: 6, quantifier: "any"}])
    },
    {
        id: "student.no-completed-course.scoped",
        schema: "courses.student",
        prompt: "performance students without any completed course",
        paths: ["courses.status.code"],
        program: program([{path: "courses.status.code", operator: "equals", value: "completed", quantifier: "none"}])
    },
    {
        id: "student.filtered-course-count.scoped",
        schema: "courses.student",
        prompt: "performance students in at least ten completed courses",
        paths: ["courses.status.code"],
        program: program([], [{
            scope: "courses", operator: "greater_or_equal", value: 10,
            where: {join: "and", clauses: [{path: "courses.status.code", operator: "equals", value: "completed"}]}
        }])
    }
];

try {
    const report = await VR.srv.call(function(configuration, definitions) {
        var search = require("server/ai/search");
        function percentile(values, fraction) {
            values = values.slice().sort(function(left, right) { return left - right; });
            return values[Math.min(values.length - 1, Math.max(0, Math.ceil(values.length * fraction) - 1))];
        }
        function merge(base, value) {
            var result = {};
            Object.keys(base || {}).forEach(function(key) { result[key] = base[key]; });
            Object.keys(value || {}).forEach(function(key) { result[key] = value[key]; });
            return result;
        }
        function executableCondition(condition, scopeCondition) {
            var replacement = scopeCondition ?
                "(id IN (SELECT id WHERE " + scopeCondition + "))" : "(0 = 0)";
            return String(condition || "").split("⟦EXTCOND⟧").join(replacement);
        }
        var results = [];
        for (var definition of definitions) {
            var course = definition.schema === "courses.course";
            var scope = course ?
                "code >= 'PERF-C-' AND code < 'PERF-C.'" :
                "code >= 'PERF-S-' AND code < 'PERF-S.'";
            var prepareStarted = Date.now();
            var prepared = search.prepareForProperties({
                schema: definition.schema,
                execution: {params: {prompt: definition.prompt, scopeCondition: scope}}
            }, definition.paths);
            if (!prepared || prepared.phase !== "query" || !prepared.definition)
                throw new Error(definition.id + ": performance reflection did not resolve directly");
            var validation = prepared.definition.validation;
            var fixed = validation && validation.fixedInput;
            if (!fixed || !fixed.token || !fixed.signature)
                throw new Error(definition.id + ": signed reflection is unavailable");
            var prepareMilliseconds = Date.now() - prepareStarted;
            var compileTimes = [];
            var countTimes = [];
            var pageTimes = [];
            var counts = [];
            var plan;
            var condition;
            var totalRuns = configuration.warmups + configuration.iterations;
            for (var run = 0; run < totalRuns; run++) {
                var compileStarted = Date.now();
                var compiled = search.compile(merge(fixed, merge({prompt: definition.prompt}, definition.program)));
                var compileMilliseconds = Date.now() - compileStarted;
                if (!compiled.plan || !compiled.plan.lines || !compiled.plan.lines.length)
                    throw new Error(definition.id + ": EXPLAIN diagnostics are missing");
                var conditionForExecution = executableCondition(compiled.condition, scope);
                var where = "(" + scope + ") AND (" + conditionForExecution + ")";
                var countStarted = Date.now();
                var count = db.find(definition.schema).COUNT({where: where});
                var countMilliseconds = Date.now() - countStarted;
                var pageStarted = Date.now();
                db.find(definition.schema).SELECT({where: where, orderBy: "code", limit: 50});
                var pageMilliseconds = Date.now() - pageStarted;
                plan = compiled.plan;
                condition = compiled.condition;
                if (run >= configuration.warmups) {
                    compileTimes.push(compileMilliseconds);
                    countTimes.push(countMilliseconds);
                    pageTimes.push(pageMilliseconds);
                    counts.push(count);
                }
            }
            for (var count of counts)
                if (count !== counts[0])
                    throw new Error(definition.id + ": repeated result count is unstable");
            var totalTimes = compileTimes.map(function(value, index) {
                return value + countTimes[index] + pageTimes[index];
            });
            results.push({
                id: definition.id,
                schema: definition.schema,
                resultCount: counts[0],
                prepareMilliseconds: prepareMilliseconds,
                compile: {p50: percentile(compileTimes, 0.50), p95: percentile(compileTimes, 0.95), max: Math.max.apply(Math, compileTimes)},
                count: {p50: percentile(countTimes, 0.50), p95: percentile(countTimes, 0.95), max: Math.max.apply(Math, countTimes)},
                firstPage: {p50: percentile(pageTimes, 0.50), p95: percentile(pageTimes, 0.95), max: Math.max.apply(Math, pageTimes)},
                total: {p50: percentile(totalTimes, 0.50), p95: percentile(totalTimes, 0.95), max: Math.max.apply(Math, totalTimes)},
                plan: plan,
                condition: condition
            });
        }
        return {settings: configuration, results: results};
    }, settings, cases);
    const failures = report.results.filter(result =>
        result.plan.risk === "high" || result.total.p95 > settings.maximumP95Milliseconds);
    console.log("AI_SEARCH_PERFORMANCE_BENCHMARK_RESULT " + JSON.stringify({
        settings: report.settings,
        results: report.results.map(result => ({
            id: result.id,
            resultCount: result.resultCount,
            prepareMilliseconds: result.prepareMilliseconds,
            compile: result.compile,
            count: result.count,
            firstPage: result.firstPage,
            total: result.total,
            risk: result.plan.risk,
            sequentialScans: result.plan.sequentialScans,
            indexLookups: result.plan.indexLookups,
            nestedLoops: result.plan.nestedLoops,
            correlatedSubqueries: result.plan.correlatedSubqueries,
            traversalCost: result.plan.traversalCost
        }))
    }));
    if (settings.verbose)
        console.log("AI_SEARCH_PERFORMANCE_BENCHMARK_DETAIL " + JSON.stringify(report));
    if (failures.length)
        throw new Error("AI search performance gate failed: " + JSON.stringify(failures.map(result => ({
            id: result.id, risk: result.plan.risk, p95: result.total.p95,
            sequentialScans: result.plan.sequentialScans,
            correlatedSubqueries: result.plan.correlatedSubqueries
        }))));
} finally {
    await VR.srv.stop();
}
