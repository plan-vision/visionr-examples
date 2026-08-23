#!/usr/bin/env vr run

const languages = ["en-US", "de-DE"];
const maximumElements = 50;

try {
    const report = await VR.srv.call(function(configuration) {
        var corpus = require("courses/ai-search-evaluation.corpus");
        var forms = require("server/forms");
        var search = require("server/ai/search");

        function expectedPaths(entry) {
            var values = [];
            var seen = {};

            function add(path, kind) {
                var key = kind + "\u0000" + path;
                if (typeof path !== "string" || !path || seen[key]) return;
                seen[key] = true;
                values.push({path: path, kind: kind});
            }

            function addClause(clause) {
                if (!clause || typeof clause !== "object") return;
                add(clause.path, "property");
                if (clause.aggregate) {
                    add(clause.aggregate.path, "property");
                    add(clause.aggregate.groupBy, "property");
                }
            }

            for (var block of entry.program.blocks || []) {
                for (var clause of block.clauses || []) addClause(clause);
                for (var count of block.counts || []) {
                    add(count.scope, "relation");
                    for (var member of count.where && count.where.clauses || [])
                        addClause(member);
                }
            }
            for (var group of entry.program.groups || [])
                for (var groupedClause of group.clauses || [])
                    addClause(groupedClause);
            return values;
        }

        var originalLanguage = session.lang && session.lang.code || String(session.lang || "");
        var results = [];
        try {
            for (var entry of corpus.cases) {
                for (var language of configuration.languages) {
                    session.lang = language;
                    var prompt = entry.prompts[language];
                    var execution = forms.getSearchAIExecution(
                        entry.schema,
                        {},
                        undefined,
                        {input: prompt, contextWindowTokens: 128000},
                        entry.scopeCondition
                    ) || {params: {}};
                    execution.params = execution.params || {};
                    execution.params.prompt = prompt;
                    execution.params.scopeCondition = entry.scopeCondition;
                    execution.params.contextWindowTokens = 128000;

                    var selected = search.planningCandidatesForRequest({
                        schema: entry.schema,
                        execution: execution,
                        maximumElements: configuration.maximumElements
                    });
                    var propertySet = {};
                    var relationSet = {};
                    for (var property of selected.projection.properties || [])
                        propertySet[property.path] = true;
                    for (var relation of selected.projection.relations || [])
                        relationSet[relation.path] = true;

                    var expected = expectedPaths(entry);
                    var missing = expected.filter(function(value) {
                        return value.kind === "relation" ?
                            !relationSet[value.path] : !propertySet[value.path];
                    });
                    var selectedElements =
                        (selected.projection.entities || []).length +
                        (selected.projection.relations || []).length +
                        (selected.projection.properties || []).length;
                    results.push({
                        id: entry.id,
                        language: language,
                        critical: entry.tags.indexOf("critical") >= 0,
                        missing: missing,
                        selectedElements: selectedElements,
                        overBudget: selectedElements > configuration.maximumElements,
                        selectedProperties: missing.length ?
                            selected.projection.properties.map(function(value) { return value.path; }) : undefined,
                        selectedRelations: missing.length ?
                            selected.projection.relations.map(function(value) { return value.path; }) : undefined
                    });
                }
            }
        } finally {
            if (originalLanguage) session.lang = originalLanguage;
        }

        var misses = results.filter(function(value) { return value.missing.length > 0; });
        var overBudget = results.filter(function(value) { return value.overBudget; });
        return {
            corpusVersion: corpus.version,
            corpusCases: corpus.cases.length,
            languages: configuration.languages,
            evaluations: results.length,
            exact: results.length - misses.length,
            criticalMissing: misses.filter(function(value) { return value.critical; }).length,
            maximumElements: configuration.maximumElements,
            largestSelection: Math.max.apply(Math, results.map(function(value) { return value.selectedElements; })),
            misses: misses,
            overBudget: overBudget
        };
    }, {languages: languages, maximumElements: maximumElements});

    console.log("AI_SEARCH_PLANNING_RECALL_RESULT " + JSON.stringify(report));
    if (report.misses.length || report.overBudget.length)
        throw new Error("AI search planning recall gate failed: " + JSON.stringify({
            misses: report.misses,
            overBudget: report.overBudget
        }));
} finally {
    await VR.srv.stop();
}
