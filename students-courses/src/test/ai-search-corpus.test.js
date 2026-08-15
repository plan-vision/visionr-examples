const assert = require("assert");
const corpus = require("../srv/ai-search-evaluation.corpus");

const languages = ["en-US", "de-DE"];
const operators = new Set([
    "equals", "not_equals", "contains", "not_contains", "begins_with", "ends_with",
    "similar", "greater_than", "greater_or_equal", "less_than", "less_or_equal",
    "between", "in", "empty", "not_empty"
]);
const quantifiers = new Set(["any", "none", "all", "all_nonempty"]);

function validateClause(clause, label) {
    assert(clause && typeof clause === "object" && !Array.isArray(clause), `${label}: clause object`);
    assert.match(clause.path, /^[A-Za-z_][A-Za-z0-9_.]*$/, `${label}: reflected property path shape`);
    assert(operators.has(clause.operator), `${label}: supported operator`);
    if (clause.quantifier !== undefined)
        assert(quantifiers.has(clause.quantifier), `${label}: supported quantifier`);
    if (clause.aggregate !== undefined) {
        assert(["max", "min", "avg"].includes(clause.aggregate.function), `${label}: aggregate function`);
        assert.match(clause.aggregate.path, /^[A-Za-z_][A-Za-z0-9_.]*$/, `${label}: aggregate path`);
        assert.strictEqual(clause.value, undefined, `${label}: aggregate must not use a literal`);
        assert.strictEqual(clause.values, undefined, `${label}: aggregate must not use literals`);
    }
}

function validateProgram(program, label) {
    assert.strictEqual(program.strategy, "condition", `${label}: acceptance gold stays live/composable`);
    assert.match(program.root, /^[A-Za-z][A-Za-z0-9_-]*$/, `${label}: root block id`);
    assert(Array.isArray(program.blocks) && program.blocks.length > 0, `${label}: recursive blocks`);
    const ids = new Set(program.blocks.map(block => block.id));
    assert.strictEqual(ids.size, program.blocks.length, `${label}: unique block ids`);
    assert(ids.has(program.root), `${label}: root block exists`);
    for (const block of program.blocks) {
        assert(["and", "or"].includes(block.join), `${label}/${block.id}: block join`);
        assert(Array.isArray(block.clauses), `${label}/${block.id}: clauses`);
        assert(Array.isArray(block.counts), `${label}/${block.id}: counts`);
        assert(Array.isArray(block.children), `${label}/${block.id}: children`);
        for (const clause of block.clauses)
            validateClause(clause, `${label}/${block.id}`);
        for (const count of block.counts) {
            assert.match(count.scope, /^[A-Za-z_][A-Za-z0-9_.]*$/, `${label}/${block.id}: count scope`);
            assert(["equals", "not_equals", "greater_than", "greater_or_equal", "less_than", "less_or_equal"].includes(count.operator), `${label}/${block.id}: count operator`);
            assert(Number.isInteger(count.value) && count.value >= 0, `${label}/${block.id}: count value`);
            if (count.where)
                for (const clause of count.where.clauses || [])
                    validateClause(clause, `${label}/${block.id}/count`);
        }
        for (const child of block.children)
            assert(ids.has(child), `${label}/${block.id}: child exists`);
    }
}

function run() {
    assert.strictEqual(corpus.version, 1);
    assert(corpus.thresholds.exactMatchRate >= 0.9);
    assert.strictEqual(corpus.thresholds.criticalExactMatchRate, 1);
    assert(corpus.cases.length >= 20, "acceptance corpus must cover a meaningful semantic surface");

    const ids = new Set();
    let critical = 0;
    const coveredSchemas = new Set();
    const coveredTags = new Set();
    for (const entry of corpus.cases) {
        assert(!ids.has(entry.id), `duplicate corpus case ${entry.id}`);
        ids.add(entry.id);
        assert.match(entry.schema, /^courses\.[a-z_]+$/);
        assert.strictEqual(entry.scopeCondition, "code < 'PERF-' OR code >= 'PERF.'",
            `${entry.id}: deterministic primary acceptance scope`);
        coveredSchemas.add(entry.schema);
        assert(Array.isArray(entry.tags) && entry.tags.length > 0, `${entry.id}: tags`);
        for (const tag of entry.tags) coveredTags.add(tag);
        if (entry.tags.includes("critical")) critical++;
        for (const language of languages)
            assert(typeof entry.prompts[language] === "string" && entry.prompts[language].length >= 4, `${entry.id}: ${language} prompt`);
        assert(Array.isArray(entry.expectedCodes), `${entry.id}: expected code set`);
        assert.deepStrictEqual(entry.expectedCodes, [...new Set(entry.expectedCodes)].sort(), `${entry.id}: stable unique expected code set`);
        validateProgram(entry.program, entry.id);
    }

    assert(critical >= 10, "critical semantic cases must dominate the release gate");
    assert.deepStrictEqual([...coveredSchemas].sort(), ["courses.course", "courses.department", "courses.student"]);
    for (const required of ["aggregate", "average", "grouped", "count", "zero", "none", "all", "option", "boolean", "datetime", "relation"])
        assert(coveredTags.has(required), `missing semantic coverage tag ${required}`);

    console.log(`AI search corpus: ok (${corpus.cases.length} cases, ${languages.length} languages)`);
}

if (require.main === module)
    run();

module.exports = run;
