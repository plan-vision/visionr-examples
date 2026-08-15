// @allowRemote

// Development-only acceptance façade for the students-courses AI-search
// corpus. Gold programs stay server-side. Model output is always recompiled
// against a fresh, HMAC-signed META reflection before a bounded query runs.

var corpus=require('courses/ai-search-evaluation.corpus');
var search=require('server/ai/search');

var MAX_RESULTS=16384;

function requireDevelopmentSession() {
    if (!session.loggedIn || !session.user || !session.runtime || !session.runtime.devel)
        throw new Error('AI search evaluation is available only to a logged-in development session');
}

function cleanText(value,max,label) {
    value=value == null ? '' : String(value).trim();
    if (!value || value.length > max)
        throw new Error(label+' is invalid');
    return value;
}

function findCase(id) {
    id=cleanText(id,120,'AI search evaluation case');
    for (var entry of corpus.cases)
        if (entry.id === id)
            return entry;
    throw new Error('Unknown AI search evaluation case: '+id);
}

function caseLanguage(entry,language) {
    language=cleanText(language,20,'AI search evaluation language');
    if (!entry.prompts || typeof entry.prompts[language] !== 'string')
        throw new Error('Unsupported language '+language+' for '+entry.id);
    return language;
}

function schemaFor(entry) {
    var schema=db.find(entry.schema);
    if (!schema || !schema.ACCESS || !schema.ACCESS.readable)
        throw new Error('Evaluation schema is not readable: '+entry.schema);
    var codeMeta=schema.META('code');
    if (!codeMeta || !codeMeta.ACCESS || !codeMeta.ACCESS.readable)
        throw new Error('Evaluation code property is not readable: '+entry.schema);
    return schema;
}

function scopedCondition(scope,condition) {
    return scope ? '('+scope+') AND ('+condition+')' : condition;
}

function fixedInput(prepared) {
    var validation=prepared && prepared.definition && prepared.definition.validation;
    var fixed=validation && validation.fixedInput;
    if (!fixed || typeof fixed.token !== 'string' || typeof fixed.signature !== 'string')
        throw new Error('AI search evaluation could not obtain a signed reflection');
    return fixed;
}

function decorated(prepared,entry,language) {
	var definition=prepared.definition || prepared.link && prepared.link.definition;
	if (definition) {
		definition.language=language;
		definition.systemPrompt+=' This acceptance prompt is written in '+language+'; preserve its meaning without translating schema codes or option codes.';
	}
	return prepared;
}

function prepare(entry,language,options,properties) {
	options=options||{};
	var request={
        schema:entry.schema,
        execution:{params:{
            prompt:entry.prompts[language],
            scopeCondition:entry.scopeCondition,
			guidance:'Students-courses multilingual acceptance case '+entry.id+'. Preserve the exact ORDBM meaning.',
			connection:options.connection,
			contextWindowTokens:options.contextWindowTokens
        }}
	};
	var prepared=properties ? search.prepareForProperties(request,properties) : search.prepareDialog(request);
	return decorated(prepared,entry,language);
}

function programPaths(entry,program) {
	var result=[];
	var seen={};
	var add=function(path){
		if (typeof path == 'string' && path && !seen[path]) {seen[path]=true;result.push(path);}
	};
	var addClause=function(clause){
		if (!clause || typeof clause != 'object') return;
		add(clause.path);
		if (clause.aggregate) {add(clause.aggregate.path);add(clause.aggregate.groupBy);}
	};
	for (var block of program.blocks||[]) {
		for (var clause of block.clauses||[]) addClause(clause);
		for (var count of block.counts||[]) {
			for (var clause of count.where && count.where.clauses||[]) addClause(clause);
			if (typeof count.scope == 'string') {
				var reflection=search.reflect(entry.schema,[count.scope]);
				var representative=reflection.properties.find(function(property){
					return property.path.indexOf(count.scope+'.') === 0;
				});
				if (representative) add(representative.path);
			}
		}
	}
	for (var group of program.groups||[])
		for (var clause of group.clauses||[]) addClause(clause);
	return result;
}

function compileProgram(entry,language,program) {
    if (!program || typeof program !== 'object' || Array.isArray(program))
        throw new Error('AI search evaluation requires a typed program');
	var prepared=prepare(entry,language,{},programPaths(entry,program));
    var fixed=fixedInput(prepared);
    return search.compile({
        token:fixed.token,
        signature:fixed.signature,
        prompt:entry.prompts[language],
        strategy:program.strategy,
        root:program.root,
        blocks:program.blocks,
        join:program.join,
        groups:program.groups
    });
}

function resultCodes(entry,compiled) {
    var schema=schemaFor(entry);
    var values=schema.SELECT({
        where:scopedCondition(entry.scopeCondition,compiled.condition),
        orderBy:'code',
        limit:MAX_RESULTS+1
    });
    if (values.length > MAX_RESULTS)
        throw new Error('AI search evaluation exceeds '+MAX_RESULTS+' readable objects');
    var result=[];
    for (var value of values) {
        if (value && value.ACCESS && value.ACCESS.readable)
            result.push(String(value.code));
    }
    return result.sort();
}

function setMetrics(expected,actual) {
    var expectedSet={};
    var actualSet={};
    for (var value of expected) expectedSet[value]=true;
    for (var value of actual) actualSet[value]=true;
    var intersection=0;
    for (var value of actual)
        if (expectedSet[value]) intersection++;
    var union=Object.keys(expectedSet).length;
    for (var value of actual)
        if (!expectedSet[value]) union++;
    var missing=expected.filter(function(value) { return !actualSet[value]; });
    var unexpected=actual.filter(function(value) { return !expectedSet[value]; });
    return {
        exact:missing.length === 0 && unexpected.length === 0,
        precision:actual.length ? intersection/actual.length : expected.length ? 0 : 1,
        recall:expected.length ? intersection/expected.length : actual.length ? 0 : 1,
        jaccard:union ? intersection/union : 1,
        missing:missing,
        unexpected:unexpected
    };
}

function evaluated(entry,language,program) {
    var started=Date.now();
    var compiled=compileProgram(entry,language,program);
    var actual=resultCodes(entry,compiled);
    var metrics=setMetrics(entry.expectedCodes,actual);
    return {
        caseId:entry.id,
        language:language,
        schema:entry.schema,
        tags:entry.tags,
        critical:entry.tags.indexOf('critical') >= 0,
        expectedCodes:entry.expectedCodes,
        actualCodes:actual,
        exact:metrics.exact,
        precision:metrics.precision,
        recall:metrics.recall,
        jaccard:metrics.jaccard,
        missing:metrics.missing,
        unexpected:metrics.unexpected,
        condition:compiled.condition,
        strategy:compiled.strategy,
        blockResults:compiled.blockResults,
        plan:compiled.plan,
        program:compiled.program,
        durationMilliseconds:Date.now()-started
    };
}

exports.getCorpus=function() {
    requireDevelopmentSession();
    return {
        version:corpus.version,
        name:corpus.name,
        thresholds:corpus.thresholds,
        languages:['en-US','de-DE'],
        cases:corpus.cases.map(function(entry) {
            return {
                id:entry.id,
                schema:entry.schema,
                tags:entry.tags,
                critical:entry.tags.indexOf('critical') >= 0,
                prompts:entry.prompts,
                expectedCount:entry.expectedCodes.length
            };
        })
    };
};

exports.prepare=function(value) {
    requireDevelopmentSession();
    value=value || {};
    var entry=findCase(value.caseId);
    var language=caseLanguage(entry,value.language);
	var prepared=prepare(entry,language,{
		connection:value.connection,
		contextWindowTokens:value.contextWindowTokens
	});
	prepared.caseId=entry.id;
	prepared.language=language;
	return prepared;
};

exports.continueSchemaLink=function(value) {
	requireDevelopmentSession();
	value=value||{};
	var entry=findCase(value.caseId);
	var language=caseLanguage(entry,value.language);
	return decorated(search.continueSchemaLink(value.link),entry,language);
};

exports.evaluate=function(value) {
    requireDevelopmentSession();
    value=value || {};
    var entry=findCase(value.caseId);
    var language=caseLanguage(entry,value.language);
    var draft=value.draft;
    return evaluated(entry,language,draft && draft.program ? draft.program : value.program);
};

exports.preflight=function() {
    requireDevelopmentSession();
    var results=[];
    for (var entry of corpus.cases) {
        for (var language of ['en-US','de-DE']) {
            try {
                results.push(evaluated(entry,language,entry.program));
            } catch (error) {
                results.push({
                    caseId:entry.id,
                    language:language,
                    schema:entry.schema,
                    tags:entry.tags,
                    critical:entry.tags.indexOf('critical') >= 0,
                    exact:false,
                    invalid:true,
                    error:error instanceof Error ? error.message : String(error)
                });
            }
        }
    }
    return {version:corpus.version,thresholds:corpus.thresholds,results:results};
};
