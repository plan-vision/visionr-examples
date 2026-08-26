#!/usr/bin/env vr run

/*
 * Read-only acceptance for the production NL Search route. This enters through
 * the same Forms execution descriptor and signed Search ticket as the browser.
 * It never calls the provider/protocol directly and never changes project data.
 */

const fs=require("fs");
const path=require("path");

const languages=["en-US","de-DE"];
const requestedCaseIds=String(process.env.CYPHER_RI_CASES||"").split(",")
    .map(value=>value.trim()).filter(Boolean);
const runName=new Date().toISOString().replace(/[:.]/g,"-");
const outputRoot=path.resolve("target/ai-search-cypher-ri-production",runName);

function write(file,value) {
    const target=path.join(outputRoot,file);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,JSON.stringify(value,null,2));
}

try {
    let manifest=await VR.srv.call(function() {
        return require("courses/ai-search-evaluation.corpus").cases.map(function(entry) {
            return {id:entry.id,schema:entry.schema,tags:entry.tags,prompts:entry.prompts};
        });
    });
    if (requestedCaseIds.length)
        manifest=manifest.filter(entry=>requestedCaseIds.includes(entry.id));
    if (!manifest.length) throw new Error("Cypher-RI production selection contains no corpus cases");

    const summary={version:1,languages,corpusCases:manifest.length,evaluations:0,
        prepared:0,planned:0,compiled:0,executed:0,exact:0,modelCalls:0,
        promptTokens:0,completionTokens:0,durationMs:0,phaseModelCalls:{},
        phaseDurationMs:{},modelCallDistribution:{},failures:[]};

    for (const entry of manifest) for (const language of languages) {
        const artifact=await VR.srv.call(function(configuration) {
            var corpus=require("courses/ai-search-evaluation.corpus");
            var forms=require("server/forms");
            var search=require("server/ai/search");
            var selected=corpus.cases.filter(function(value) {
                return value.id===configuration.id;
            })[0];
            if (!selected) throw new Error("Unknown corpus case");

            function message(error) {
                return String(error&&error.message||error||"Unknown failure").substring(0,1000);
            }
            function executableCondition(condition,scopeCondition) {
                var replacement=scopeCondition ?
                    "(id IN (SELECT id WHERE "+scopeCondition+"))" : "(0 = 0)";
                return String(condition||"").split("⟦EXTCOND⟧").join(replacement);
            }
            function actualCodes(draft) {
                var schema=db.find(selected.schema);
                if (!schema||!schema.ACCESS||!schema.ACCESS.readable)
                    throw new Error("Cypher-RI production schema is not readable");
                var condition=executableCondition(draft.condition,selected.scopeCondition);
                var where=selected.scopeCondition ?
                    "("+selected.scopeCondition+") AND ("+condition+")" : condition;
                var values=schema.SELECT({where:where,orderBy:"code",limit:16385});
                if (values.length>16384)
                    throw new Error("Cypher-RI production result exceeds 16384 objects");
                return values.filter(function(value) {
                    return value&&value.ACCESS&&value.ACCESS.readable;
                }).map(function(value) { return String(value.code); }).sort();
            }
            function parity(expected,actual) {
                var expectedSet={},actualSet={};
                for (var left of expected) expectedSet[left]=true;
                for (var right of actual) actualSet[right]=true;
                var missing=expected.filter(function(value) { return !actualSet[value]; });
                var unexpected=actual.filter(function(value) { return !expectedSet[value]; });
                return {exact:!missing.length&&!unexpected.length,missing:missing,unexpected:unexpected};
            }

            var originalLanguage=session.lang&&session.lang.code||String(session.lang||"");
            var result={id:selected.id,language:configuration.language,
                prompt:selected.prompts[configuration.language]};
            try {
                session.lang=configuration.language;
                var execution=forms.getSearchAIExecution(selected.schema,{},undefined,
                    {input:result.prompt},selected.scopeCondition);
                if (!execution) throw new Error("NL Search is unavailable");
                result.connection=execution.params&&execution.params.connection;
                var prepared=search.prepareDialog({schema:selected.schema,execution:execution});
                result.phase=prepared.phase;
                result.prepared=prepared.phase==="cypher-ri"&&!!prepared.planning;
                if (!result.prepared) throw new Error("Production Search did not select Cypher-RI");
                var planned=search.executeCypherRI(prepared.planning);
                result.valid=planned&&planned.valid===true;
                result.errors=planned&&planned.errors||[];
                result.diagnostics=planned&&planned.diagnostics||[];
                result.metrics=planned&&planned.metrics||{};
                if (!result.valid||!planned.draft)
                    throw new Error(result.errors[0]&&result.errors[0].message||
                        "Cypher-RI production planning failed");
                result.compiled=true;
                result.condition=planned.draft.condition;
                result.plan=planned.draft.plan;
                result.expectedCodes=selected.expectedCodes;
                result.actualCodes=actualCodes(planned.draft);
                var comparison=parity(result.expectedCodes,result.actualCodes);
                result.exact=comparison.exact;
                result.missing=comparison.missing;
                result.unexpected=comparison.unexpected;
                result.executed=true;
                return result;
            } catch (error) {
                result.error=message(error);
                return result;
            } finally {
                if (originalLanguage) session.lang=originalLanguage;
            }
        },{id:entry.id,language});

        summary.evaluations++;
        if (artifact.prepared) summary.prepared++;
        if (artifact.valid) summary.planned++;
        if (artifact.compiled) summary.compiled++;
        if (artifact.executed) summary.executed++;
        if (artifact.exact) summary.exact++;
        summary.modelCalls+=artifact.metrics&&artifact.metrics.modelCalls||0;
        summary.promptTokens+=artifact.metrics&&artifact.metrics.inputTokens||0;
        summary.completionTokens+=artifact.metrics&&artifact.metrics.outputTokens||0;
        summary.durationMs+=artifact.metrics&&artifact.metrics.durationMs||0;
        var callBucket=String(artifact.metrics&&artifact.metrics.modelCalls||0);
        summary.modelCallDistribution[callBucket]=(summary.modelCallDistribution[callBucket]||0)+1;
        for (var phaseName of Object.keys(artifact.metrics&&artifact.metrics.phases||{})) {
            var phaseMetrics=artifact.metrics.phases[phaseName]||{};
            summary.phaseModelCalls[phaseName]=(summary.phaseModelCalls[phaseName]||0)+
                (phaseMetrics.modelCalls||0);
            summary.phaseDurationMs[phaseName]=(summary.phaseDurationMs[phaseName]||0)+
                (phaseMetrics.durationMs||0);
        }
        if (artifact.error||!artifact.exact)
            summary.failures.push({id:entry.id,language,error:artifact.error,
                errors:artifact.errors,missing:artifact.missing,unexpected:artifact.unexpected});
        write(`${entry.id}/${language}.json`,artifact);
        console.log(`CYPHER_RI_PRODUCTION_PROGRESS ${summary.evaluations}/`+
            `${manifest.length*languages.length} ${entry.id} ${language} `+
            `${artifact.exact?"exact":"failed"}`);
    }

    write("summary.json",summary);
    console.log("CYPHER_RI_PRODUCTION_RESULT "+JSON.stringify({...summary,
        artifactDirectory:outputRoot}));
} finally {
    await VR.srv.stop();
}
