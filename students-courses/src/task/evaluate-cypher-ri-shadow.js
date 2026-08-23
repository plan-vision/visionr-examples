#!/usr/bin/env vr run

/*
 * Read-only public Cypher-RI shadow corpus. Each case uses current access-aware
 * Forms reflection and deterministic Stage-0 retrieval. Accepted model output
 * is lowered through the typed Java AST receipt, compiled by the normal signed
 * Search compiler, and executed read-only for exact comparison with the frozen
 * public result oracle. It never enters the production Search route.
 */

const fs = require("fs");
const path = require("path");

const connection = "runpod-cypher-ri";
const languages = ["en-US", "de-DE"];
const maximumElements = 50;
const requestedCaseIds = String(process.env.CYPHER_RI_CASES || "").split(",").map(value => value.trim()).filter(Boolean);
const runName = new Date().toISOString().replace(/[:.]/g, "-");
const outputRoot = path.resolve("target/ai-search-cypher-ri-shadow", runName);

function write(file, value) {
    const target = path.join(outputRoot, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, typeof value === "string" ? value : JSON.stringify(value, null, 2));
}

function increment(target, key) {
    key = String(key || "unknown");
    target[key] = (target[key] || 0) + 1;
}

try {
    let manifest = await VR.srv.call(function() {
        var corpus = require("courses/ai-search-evaluation.corpus");
        return corpus.cases.map(function(entry) {
            return {id: entry.id, schema: entry.schema, tags: entry.tags, prompts: entry.prompts};
        });
    });
    if (requestedCaseIds.length)
        manifest = manifest.filter(entry => requestedCaseIds.includes(entry.id));
    if (!manifest.length) throw new Error("Cypher-RI shadow selection contains no corpus cases");
    const summary = {
        version: 5,
        connection,
        languages,
        corpusCases: manifest.length,
        evaluations: 0,
        selectionAccepted: 0,
        selectionRepairAttempted: 0,
        selectionRepairSucceeded: 0,
        selectionGoldComplete: 0,
        generationCompleted: 0,
        collectionMeaningAudited: 0,
		collectionMeaningFallbackAttempted: 0,
		collectionMeaningFallbackSucceeded: 0,
		groupedAggregateFallbackAttempted: 0,
		groupedAggregateFallbackSucceeded: 0,
		transportRetryAttempted: 0,
		transportRetrySucceeded: 0,
        generationRepairAttempted: 0,
        generationRepairSucceeded: 0,
        parserAcceptedRaw: 0,
        projectionAccepted: 0,
        loweringAccepted: 0,
        compileAccepted: 0,
        executed: 0,
        exact: 0,
        promptTokens: 0,
        completionTokens: 0,
        diagnostics: {},
        normalizations: {},
        failures: []
    };

    for (const entry of manifest) {
        for (const language of languages) {
            const artifact = await VR.srv.call(function(configuration) {
                var corpus = require("courses/ai-search-evaluation.corpus");
                var forms = require("server/forms");
                var search = require("server/ai/search");
                var protocol = require("server/ai/search-cypher-ri-protocol");
                var contract = require("server/ai/search-cypher-contract");
                var projectionModule = require("server/ai/search-planning-projection");
                var selectedEntry = corpus.cases.filter(function(value) { return value.id === configuration.id; })[0];
                if (!selectedEntry) throw new Error("Unknown corpus case");

                function message(error) {
                    return String(error && error.message || error || "Unknown failure").substring(0, 1000);
                }

				var transportRetryUsed=false;
				function modelCompletion(request) {
					var serialized=JSON.stringify(request);
					try { return JSON.parse(JSCORE.Exec.completeAI(configuration.connection,serialized)); }
					catch (error) {
						if (transportRetryUsed||!/\b(?:429|500|502|503|504)\b/.test(message(error)))
							throw error;
						transportRetryUsed=true;result.transportRetryAttempted=true;
						var retried=JSON.parse(JSCORE.Exec.completeAI(configuration.connection,serialized));
						result.transportRetrySucceeded=true;
						return retried;
					}
				}

                function validateInspection(projection, inspection, prompt) {
                    var validation = contract.validate(projection, inspection);
                    var semantic = protocol.requestValueResolution(projection, inspection, prompt);
                    if (semantic.normalizedPredicate) {
                        validation.normalizedPredicate = semantic.normalizedPredicate;
                        validation.normalizations = (validation.normalizations || []).concat([
                            semantic.normalization
                        ]);
                    }
                    if (semantic.diagnostics.length) {
                        validation.diagnostics = (validation.diagnostics || []).concat(semantic.diagnostics);
                        validation.accepted = false;
                    }
                    return validation;
                }

                function executableCondition(condition, scopeCondition) {
                    var replacement = scopeCondition ?
                        "(id IN (SELECT id WHERE " + scopeCondition + "))" : "(0 = 0)";
                    return String(condition || "").split("⟦EXTCOND⟧").join(replacement);
                }

                function actualCodes(entry, draft) {
                    var schema = db.find(entry.schema);
                    if (!schema || !schema.ACCESS || !schema.ACCESS.readable)
                        throw new Error("Cypher-RI shadow schema is not readable");
                    var condition = executableCondition(draft.condition, entry.scopeCondition);
                    var where = entry.scopeCondition ?
                        "(" + entry.scopeCondition + ") AND (" + condition + ")" : condition;
                    var values = schema.SELECT({where: where, orderBy: "code", limit: 16385});
                    if (values.length > 16384)
                        throw new Error("Cypher-RI shadow result exceeds 16384 objects");
                    return values.filter(function(value) {
                        return value && value.ACCESS && value.ACCESS.readable;
                    }).map(function(value) { return String(value.code); }).sort();
                }

                function setMetrics(expected, actual) {
                    var expectedSet = {}, actualSet = {};
                    for (var expectedValue of expected) expectedSet[expectedValue] = true;
                    for (var actualValue of actual) actualSet[actualValue] = true;
                    var missing = expected.filter(function(value) { return !actualSet[value]; });
                    var unexpected = actual.filter(function(value) { return !expectedSet[value]; });
                    var intersection = actual.filter(function(value) { return expectedSet[value]; }).length;
                    var union = Object.keys(expectedSet).length + unexpected.length;
                    return {
                        exact: !missing.length && !unexpected.length,
                        precision: actual.length ? intersection / actual.length : expected.length ? 0 : 1,
                        recall: expected.length ? intersection / expected.length : actual.length ? 0 : 1,
                        jaccard: union ? intersection / union : 1,
                        missing: missing,
                        unexpected: unexpected
                    };
                }

                function requiredPaths(program) {
                    var properties = {}, relations = {};
                    function property(clause) {
                        if (!clause) return;
                        if (clause.path) properties[clause.path] = true;
                        if (clause.aggregate) {
                            if (clause.aggregate.path) properties[clause.aggregate.path] = true;
                            if (clause.aggregate.groupBy) properties[clause.aggregate.groupBy] = true;
							if (clause.aggregate.groupByRelation)
								relations[clause.aggregate.groupByRelation] = true;
                        }
                    }
                    for (var block of program.blocks || []) {
                        for (var clause of block.clauses || []) property(clause);
                        for (var count of block.counts || []) {
                            if (count.scope) relations[count.scope] = true;
                            for (var member of count.where && count.where.clauses || []) property(member);
                        }
                    }
                    for (var group of program.groups || [])
                        for (var grouped of group.clauses || []) property(grouped);
                    return {properties: properties, relations: relations};
                }

				function requiredSelectionQuantifiers(program,projection) {
					var result={},relationByPath={},propertyByPath={};
					for (var relation of projection.relations||[]) relationByPath[relation.path]=relation;
					for (var property of projection.properties||[]) propertyByPath[property.path]=property;
					function select(path,mode) {
						var relation=relationByPath[path];
						if (!relation||relation.cardinality!=="many") return;
					var quantifier={any:"exists",none:"not_exists",all:"all_allow_empty",
							all_nonempty:"all_require_nonempty",count:"count"}[mode];
						if (quantifier) result[relation.alias]=quantifier;
					}
					function clause(value) {
						if (!value) return;
						var property=propertyByPath[value.path];
						for (var relationPath of property&&property.relationPath||[])
							if (relationByPath[relationPath]&&relationByPath[relationPath].cardinality==="many")
								select(relationPath,value.quantifier||"any");
						if (relationByPath[value.path]&&relationByPath[value.path].cardinality==="many")
							select(value.path,value.operator==="empty"?"none":"any");
					}
					for (var block of program.blocks||[]) {
						for (var value of block.clauses||[]) clause(value);
						for (var count of block.counts||[]) {
							select(count.scope,count.operator==="equals"&&Number(count.value)===0?"none":"count");
							for (var member of count.where&&count.where.clauses||[]) clause(member);
						}
					}
					return result;
				}

                var originalLanguage = session.lang && session.lang.code || String(session.lang || "");
                var result = {id: selectedEntry.id, language: configuration.language, prompt: selectedEntry.prompts[configuration.language]};
                try {
                    session.lang = configuration.language;
                    var execution = forms.getSearchAIExecution(
                        selectedEntry.schema, {}, undefined,
                        {input: result.prompt, contextWindowTokens: 32768}, selectedEntry.scopeCondition
                    ) || {params: {}};
                    execution.params = execution.params || {};
                    execution.params.prompt = result.prompt;
                    execution.params.scopeCondition = selectedEntry.scopeCondition;
                    execution.params.contextWindowTokens = 32768;
                    var planning = search.planningCandidatesForRequest({
                        schema: selectedEntry.schema,
                        execution: execution,
                        maximumElements: configuration.maximumElements
                    });
                    result.projection = planning.projection;
                    var required = requiredPaths(selectedEntry.program);
                    var requiredRelationAliases = {};
                    for (var relation of planning.projection.relations || [])
                        if (required.relations[relation.path]) requiredRelationAliases[relation.alias] = true;
                    for (var property of planning.projection.properties || [])
                        if (required.properties[property.path])
                            for (var relationPath of property.relationPath || []) {
                                var reflected = (planning.projection.relations || []).filter(function(value) {
                                    return value.path === relationPath;
                                })[0];
                                if (reflected) requiredRelationAliases[reflected.alias] = true;
                            }
                    result.requiredRelationAliases = Object.keys(requiredRelationAliases).sort();
					result.requiredSelectionQuantifiers=requiredSelectionQuantifiers(
						selectedEntry.program,planning.projection
					);

                    var schemas = protocol.schemas(planning.projection, result.prompt);
                    result.selectionPrompt = protocol.selectionPrompt(schemas.simplified, result.prompt);
                    var selectionResponse = modelCompletion({
                        prompt: result.selectionPrompt,
                        max_tokens: 1024,
                        stop: protocol.SELECTION_STOP
                    });
                    result.selectionResponse = selectionResponse.choices && selectionResponse.choices[0] &&
                        selectionResponse.choices[0].text;
                    result.selectionUsage = selectionResponse.usage || null;
                    var acceptedSelectionResponse=result.selectionResponse;
                    try {
                        var parsedSelection = protocol.parseSelection(
                            result.selectionResponse, schemas.simplified, planning.projection, result.prompt
                        );
                        result.selection = parsedSelection.selected;
                        result.selectionAccepted = true;
                        var selectedRelations = {};
                        for (var selectedRelation of result.selection.relations || [])
                            selectedRelations[selectedRelation.label] = true;
                        result.missingRequiredRelations = result.requiredRelationAliases.filter(function(alias) {
                            return !selectedRelations[alias];
                        });
                    } catch (selectionError) {
                        result.selectionInitialError=message(selectionError);
                        result.selectionRepairPrompt=protocol.selectionRepairPrompt(
                            schemas.simplified,result.prompt
                        );
                        var selectionRepairResponse=modelCompletion({
                            prompt:result.selectionRepairPrompt,max_tokens:1024,stop:protocol.SELECTION_STOP
                        });
                        result.selectionRepairResponse=selectionRepairResponse.choices &&
                            selectionRepairResponse.choices[0] && selectionRepairResponse.choices[0].text;
                        result.selectionRepairUsage=selectionRepairResponse.usage||null;
                        result.selectionRepairAttempted=true;
						result.selectionRepairReason='invalid_selection';
                        try {
                            result.selectionRepairNormalizedResponse=protocol.selectionRepairCompletion(
                                result.selectionRepairResponse
                            );
                            parsedSelection=protocol.parseSelection(
                                result.selectionRepairNormalizedResponse,schemas.simplified,
								planning.projection,result.prompt
                            );
                            acceptedSelectionResponse=result.selectionRepairNormalizedResponse;
                            result.selection=parsedSelection.selected;
                            result.selectionAccepted=true;
                            result.selectionRepairSucceeded=true;
                            var repairedRelations={};
                            for (var repairedRelation of result.selection.relations||[])
                                repairedRelations[repairedRelation.label]=true;
                            result.missingRequiredRelations=result.requiredRelationAliases.filter(function(alias) {
                                return !repairedRelations[alias];
                            });
                        } catch (selectionRepairError) {
                            result.stage="selection";
                            result.error=message(selectionRepairError);
                            return result;
                        }
					}
					protocol.applySelectionSemantics(planning.projection,result.selection);
					var generationParseFailed=false;
					result.generationPrompt = protocol.generationPrompt(
						result.selectionPrompt, acceptedSelectionResponse, schemas.detailed, result.selection
					);
					var generationResponse = modelCompletion({
						prompt: result.generationPrompt,
						max_tokens: 2048,
						stop: protocol.ANSWER_STOP
					});
					result.generationResponse = generationResponse.choices && generationResponse.choices[0] &&
						generationResponse.choices[0].text;
					result.generationUsage = generationResponse.usage || null;
					try {
						result.cypher = protocol.parseAnswer(result.generationResponse);
					} catch (generationError) {
						generationParseFailed=true;
						result.generationInitialError=message(generationError);
					}
	                    if (!generationParseFailed) {
	                        result.inspection=JSON.parse(JSCORE.Exec.inspectCypherSearchQuery(result.cypher));
	                        result.validation=validateInspection(planning.projection,result.inspection,result.prompt);
	                    }
					if (!generationParseFailed&&protocol.collectionMeaningAuditRequired(
						planning.projection,result.selection
					)) try {
						result.collectionMeaningAuditPrompt=protocol.collectionMeaningAuditPrompt(
							planning.projection,result.selection,result.prompt,result.cypher,
							configuration.language
						);
						var meaningResponse=modelCompletion({
								prompt:result.collectionMeaningAuditPrompt,max_tokens:256,
								stop:protocol.SELECTION_STOP
							});
						result.collectionMeaningAuditResponse=meaningResponse.choices&&
							meaningResponse.choices[0]&&meaningResponse.choices[0].text;
						result.collectionMeaningAuditUsage=meaningResponse.usage||null;
						result.collectionMeaningAudit=protocol.parseCollectionMeaningAudit(
							result.collectionMeaningAuditResponse,planning.projection,result.selection
						);
						protocol.applyCollectionMeaningAudit(
							planning.projection,result.collectionMeaningAudit
						);
						result.validation=validateInspection(planning.projection,result.inspection,result.prompt);
					} catch (meaningError) {
						result.stage='collection_meaning';result.error=message(meaningError);return result;
					}
					if (!generationParseFailed&&result.collectionMeaningAudit&&
						!result.validation.accepted) {
						result.initialCypher=result.cypher;
						result.initialInspection=result.inspection;
						result.initialValidation=result.validation;
						result.collectionMeaningFallbackCypher=protocol.auditedCollectionFallbackCypher(
							planning.projection,result.selection,schemas.detailed,result.prompt,
							result.collectionMeaningAudit,result.inspection,configuration.language
						);
						if (result.collectionMeaningFallbackCypher) {
							result.collectionMeaningFallbackAttempted=true;
							result.cypher=result.collectionMeaningFallbackCypher;
							result.inspection=JSON.parse(JSCORE.Exec.inspectCypherSearchQuery(result.cypher));
							result.validation=validateInspection(planning.projection,result.inspection,result.prompt);
							result.collectionMeaningFallbackSucceeded=result.validation.accepted;
						}
					}
					if (!generationParseFailed&&!result.validation.accepted) {
						var groupedFallback=protocol.groupedAggregateFallbackCypher(
							planning.projection,result.selection,schemas.detailed,result.inspection
						);
						if (groupedFallback) {
							if (result.initialCypher===undefined) result.initialCypher=result.cypher;
							if (result.initialInspection===undefined) result.initialInspection=result.inspection;
							if (result.initialValidation===undefined) result.initialValidation=result.validation;
							result.groupedAggregateFallbackAttempted=true;
							result.groupedAggregateFallbackCypher=groupedFallback;
							result.cypher=groupedFallback;
							result.inspection=JSON.parse(JSCORE.Exec.inspectCypherSearchQuery(result.cypher));
							result.validation=validateInspection(planning.projection,result.inspection,result.prompt);
							result.groupedAggregateFallbackSucceeded=result.validation.accepted;
						}
					}
					if (generationParseFailed || !result.validation.accepted) {
						if (result.initialCypher===undefined) result.initialCypher=result.cypher;
						if (result.initialInspection===undefined) result.initialInspection=result.inspection;
						if (result.initialValidation===undefined) result.initialValidation=result.validation;
                        result.generationRepairCategory=protocol.generationRepairCategory(
                            result.validation&&result.validation.diagnostics,generationParseFailed,
                            result.inspection,planning.projection
                        );
		                        result.generationRepairPrompt=protocol.generationRepairPrompt(
		                            result.selectionPrompt,acceptedSelectionResponse,schemas.detailed,result.selection,
		                            result.generationRepairCategory,result.initialCypher,
								result.collectionMeaningAudit
		                        );
                        var generationRepairResponse=modelCompletion({
                                prompt:result.generationRepairPrompt,max_tokens:2048,stop:protocol.ANSWER_STOP
                            });
                        result.generationRepairResponse=generationRepairResponse.choices &&
                            generationRepairResponse.choices[0] && generationRepairResponse.choices[0].text;
                        result.generationRepairUsage=generationRepairResponse.usage||null;
                        result.generationRepairAttempted=true;
                        try {
                            result.generationRepairNormalizedResponse=protocol.generationRepairCompletion(
                                result.generationRepairResponse,result.generationRepairCategory
                            );
                            result.cypher=protocol.parseAnswer(result.generationRepairNormalizedResponse);
                            result.inspection=JSON.parse(JSCORE.Exec.inspectCypherSearchQuery(result.cypher));
                            result.validation=validateInspection(planning.projection,result.inspection,result.prompt);
                            result.generationRepairSucceeded=result.validation.accepted;
                        } catch (generationRepairError) {
                            result.stage="generation";
                            result.error=message(generationRepairError);
                            return result;
                        }
                    }
                    result.stage = "validated";
                    if (!result.validation.accepted) return result;

					var predicateAliases = result.validation.inspection &&
						result.validation.inspection.predicatePropertyNames || [];
					function collectNormalizedAliases(value) {
						if (!value || typeof value !== "object") return;
						if (typeof value.property === "string" && predicateAliases.indexOf(value.property) < 0)
							predicateAliases.push(value.property);
						for (var child of value.children || []) collectNormalizedAliases(child);
					}
					collectNormalizedAliases(result.validation.normalizedPredicate);
                    var predicateAliasSet = {};
                    for (var predicateAlias of predicateAliases) predicateAliasSet[predicateAlias] = true;
                    var compilerPathSet = {}, compilerVirtualPathSet = {}, compilerRelationPathSet = {};
                    for (var selectedProperty of planning.projection.properties || [])
                        if (predicateAliasSet[selectedProperty.alias]) compilerPathSet[selectedProperty.path] = true;
                    // A relation text lookup is intentionally a virtual planner
                    // property. The canonical compiler owns it through the
                    // relation's complete effective defaultLookup, so select
                    // that signed relation root and let the shared projection
                    // helper expand only its real lookup members.
                    for (var predicateAlias of predicateAliases) {
                        var virtualRelations=(planning.projection.relations||[]).filter(function(relation) {
                            return (relation.virtualProperties||[]).some(function(property) {
                                return property&&property.kind==="entity_lookup"&&property.name===predicateAlias;
                            });
                        });
                        if (virtualRelations.length>1)
                            throw new Error("Cypher-RI shadow predicate alias is ambiguous");
                        if (virtualRelations.length===1) {
                            compilerVirtualPathSet[virtualRelations[0].path]=true;
                            compilerRelationPathSet[virtualRelations[0].path]=true;
                        }
                    }
                    for (var collectionExistence of result.validation.collectionExistences || [])
                        compilerRelationPathSet[collectionExistence.path] = true;
                    for (var collectionMember of result.validation.collectionMembers || [])
                        compilerRelationPathSet[collectionMember.path] = true;
                    for (var aggregateSemantic of result.validation.aggregateSemantics || []) {
                        if (aggregateSemantic.kind === "relation_count")
                            compilerRelationPathSet[aggregateSemantic.path] = true;
                        else if (aggregateSemantic.kind === "scalar") {
                            if (aggregateSemantic.path) compilerPathSet[aggregateSemantic.path] = true;
                            if (aggregateSemantic.groupBy) compilerPathSet[aggregateSemantic.groupBy] = true;
							if (aggregateSemantic.groupByRelation)
								compilerRelationPathSet[aggregateSemantic.groupByRelation] = true;
                        }
                    }
                    var compilerPaths = projectionModule.compilerPropertyPaths(
                        planning.projection,Object.keys(compilerPathSet).concat(Object.keys(compilerVirtualPathSet))
                    );
                    var compilerRelationPaths = Object.keys(compilerRelationPathSet).sort();
                    if (!compilerPaths.length && !compilerRelationPaths.length) {
                        var rootProperties=(planning.projection.properties || []).filter(function(property) {
                            return !property.relationPath || !property.relationPath.length;
                        }).sort(function(left,right) {
                            var leftRank=left.path === "code" ? 0 : left.type === "objecttype" ? 2 : 1;
                            var rightRank=right.path === "code" ? 0 : right.type === "objecttype" ? 2 : 1;
                            return leftRank-rightRank || left.path.localeCompare(right.path);
                        });
                        if (rootProperties.length) compilerPaths.push(rootProperties[0].path);
                    }
                    if (!compilerPaths.length && !compilerRelationPaths.length)
                        throw new Error("Cypher-RI shadow selected no compiler property or relation");
                    result.compilerPaths=compilerPaths;
                    result.compilerRelationPaths=compilerRelationPaths;
                    var fixed = search.preparePlanningCompilerContext({
                        schema: selectedEntry.schema,
                        execution: execution
                    }, compilerPaths, planning.projection, compilerRelationPaths);
                    if (!fixed || typeof fixed.token !== "string" || typeof fixed.signature !== "string")
                        throw new Error("Cypher-RI shadow could not obtain a signed planning compiler context");
                    var compilerAliases=JSON.parse(fixed.token).planningAliases;
                    if (!compilerAliases)
                        throw new Error("Cypher-RI shadow compiler context lost its signed planner aliases");
                    var compilerPropertyAliases={};
                    for (var compilerPropertyAlias of compilerAliases.properties || [])
                        compilerPropertyAliases[compilerPropertyAlias.alias]=true;
                    var missingPredicateAlias=predicateAliases.filter(function(alias) {
                        if (compilerPropertyAliases[alias]) return false;
                        return !(planning.projection.relations||[]).some(function(relation) {
                            return compilerVirtualPathSet[relation.path]&&(relation.virtualProperties||[])
                                .some(function(property) { return property&&property.name===alias; });
                        });
                    });
                    if (missingPredicateAlias.length)
                        throw new Error("Cypher-RI shadow compiler context omitted a predicate alias");
                    result.stage = "lowering";
                    var lowered = search.lowerPlanningCypher({
                        token: fixed.token,
                        signature: fixed.signature,
                        prompt: result.prompt,
                        cypher: result.cypher,
                        maximumElements: configuration.maximumElements
                    });
                    result.loweringAccepted = true;
                    result.evidenceReceipts = lowered.evidenceReceipts;
                    result.stage = "compiling";
                    var draft = search.compile({
                        token: fixed.token,
                        signature: fixed.signature,
                        prompt: result.prompt,
                        strategy: lowered.program.strategy,
                        root: lowered.program.root,
                        blocks: lowered.program.blocks
                    });
                    result.compileAccepted = true;
                    result.program = draft.program;
                    result.condition = draft.condition;
                    result.plan = draft.plan;
                    result.expectedCodes = selectedEntry.expectedCodes;
                    result.stage = "executing";
                    result.actualCodes = actualCodes(selectedEntry, draft);
                    var parity = setMetrics(result.expectedCodes, result.actualCodes);
                    for (var parityKey in parity) result[parityKey] = parity[parityKey];
                    result.stage = "executed";
                    return result;
                } catch (error) {
                    result.stage = result.stage || "transport";
                    result.error = message(error);
                    return result;
                } finally {
                    if (originalLanguage) session.lang = originalLanguage;
                }
            }, {connection, id: entry.id, language, maximumElements});

            const key = `${entry.id}/${language}`;
            write(`${key}/projection.json`, artifact.projection || null);
            write(`${key}/selection.request.txt`, artifact.selectionPrompt || "");
            write(`${key}/selection.response.txt`, artifact.selectionResponse || "");
            write(`${key}/selection.repair.request.txt`, artifact.selectionRepairPrompt || "");
            write(`${key}/selection.repair.response.txt`, artifact.selectionRepairResponse || "");
            write(`${key}/selection.parsed.json`, artifact.selection || null);
            write(`${key}/generation.request.txt`, artifact.generationPrompt || "");
            write(`${key}/generation.response.txt`, artifact.generationResponse || "");
			write(`${key}/collection-meaning.request.txt`, artifact.collectionMeaningAuditPrompt || "");
			write(`${key}/collection-meaning.response.txt`, artifact.collectionMeaningAuditResponse || "");
            write(`${key}/generation.repair.request.txt`, artifact.generationRepairPrompt || "");
            write(`${key}/generation.repair.response.txt`, artifact.generationRepairResponse || "");
            write(`${key}/parsed.json`, {
                id: artifact.id,
                language: artifact.language,
                prompt: artifact.prompt,
                stage: artifact.stage,
                error: artifact.error,
                requiredRelationAliases: artifact.requiredRelationAliases,
				missingRequiredRelations: artifact.missingRequiredRelations,
				requiredSelectionQuantifiers:artifact.requiredSelectionQuantifiers,
                selectionInitialError: artifact.selectionInitialError,
                selectionRepairAttempted: artifact.selectionRepairAttempted,
                selectionRepairSucceeded: artifact.selectionRepairSucceeded,
				selectionRepairReason: artifact.selectionRepairReason,
                generationInitialError: artifact.generationInitialError,
				collectionMeaningAudit:artifact.collectionMeaningAudit,
				collectionMeaningFallbackCypher:artifact.collectionMeaningFallbackCypher,
				collectionMeaningFallbackAttempted:artifact.collectionMeaningFallbackAttempted,
				collectionMeaningFallbackSucceeded:artifact.collectionMeaningFallbackSucceeded,
				groupedAggregateFallbackCypher:artifact.groupedAggregateFallbackCypher,
				groupedAggregateFallbackAttempted:artifact.groupedAggregateFallbackAttempted,
				groupedAggregateFallbackSucceeded:artifact.groupedAggregateFallbackSucceeded,
				transportRetryAttempted:artifact.transportRetryAttempted,
				transportRetrySucceeded:artifact.transportRetrySucceeded,
                generationRepairCategory: artifact.generationRepairCategory,
                generationRepairAttempted: artifact.generationRepairAttempted,
                generationRepairSucceeded: artifact.generationRepairSucceeded,
                initialCypher: artifact.initialCypher,
                initialInspection: artifact.initialInspection,
                initialValidation: artifact.initialValidation,
                cypher: artifact.cypher,
                inspection: artifact.inspection,
                validation: artifact.validation
            });
            write(`${key}/compiled.json`, artifact.program ? {
                program: artifact.program,
                evidenceReceipts: artifact.evidenceReceipts,
                condition: artifact.condition,
                plan: artifact.plan,
                expectedCodes: artifact.expectedCodes,
                actualCodes: artifact.actualCodes,
                exact: artifact.exact,
                precision: artifact.precision,
                recall: artifact.recall,
                jaccard: artifact.jaccard,
                missing: artifact.missing,
                unexpected: artifact.unexpected
            } : null);
            write(`${key}/metrics.json`, {
                selectionUsage: artifact.selectionUsage,
                selectionRepairUsage: artifact.selectionRepairUsage,
                generationUsage: artifact.generationUsage,
				collectionMeaningAuditUsage:artifact.collectionMeaningAuditUsage,
                generationRepairUsage: artifact.generationRepairUsage
            });

            summary.evaluations++;
            if (artifact.selectionAccepted) summary.selectionAccepted++;
            if (artifact.selectionRepairAttempted) summary.selectionRepairAttempted++;
            if (artifact.selectionRepairSucceeded) summary.selectionRepairSucceeded++;
			if (artifact.selectionAccepted && !(artifact.missingRequiredRelations || []).length)
				summary.selectionGoldComplete++;
            if (artifact.cypher) summary.generationCompleted++;
			if (artifact.collectionMeaningAudit) summary.collectionMeaningAudited++;
			if (artifact.collectionMeaningFallbackAttempted) summary.collectionMeaningFallbackAttempted++;
			if (artifact.collectionMeaningFallbackSucceeded) summary.collectionMeaningFallbackSucceeded++;
			if (artifact.groupedAggregateFallbackAttempted) summary.groupedAggregateFallbackAttempted++;
			if (artifact.groupedAggregateFallbackSucceeded) summary.groupedAggregateFallbackSucceeded++;
			if (artifact.transportRetryAttempted) summary.transportRetryAttempted++;
			if (artifact.transportRetrySucceeded) summary.transportRetrySucceeded++;
            if (artifact.generationRepairAttempted) summary.generationRepairAttempted++;
            if (artifact.generationRepairSucceeded) summary.generationRepairSucceeded++;
            if (artifact.inspection && artifact.inspection.accepted) summary.parserAcceptedRaw++;
            if (artifact.validation && artifact.validation.accepted) summary.projectionAccepted++;
            if (artifact.loweringAccepted) summary.loweringAccepted++;
            if (artifact.compileAccepted) summary.compileAccepted++;
            if (artifact.stage === "executed") summary.executed++;
            if (artifact.exact) summary.exact++;
            for (const usage of [artifact.selectionUsage, artifact.selectionRepairUsage,
				artifact.generationUsage,artifact.collectionMeaningAuditUsage,
				artifact.generationRepairUsage]) {
                summary.promptTokens += usage && usage.prompt_tokens || 0;
                summary.completionTokens += usage && usage.completion_tokens || 0;
            }
            for (const diagnostic of artifact.validation && artifact.validation.diagnostics || [])
                increment(summary.diagnostics, diagnostic.code);
            for (const normalization of artifact.validation && artifact.validation.normalizations || [])
                increment(summary.normalizations, normalization.kind);
            if (artifact.error || !artifact.validation || !artifact.validation.accepted ||
                artifact.stage !== "executed" || !artifact.exact)
                summary.failures.push({id: entry.id, language, stage: artifact.stage,
                    error: artifact.error, diagnostics: artifact.validation && artifact.validation.diagnostics,
                    missing: artifact.missing, unexpected: artifact.unexpected});
            console.log(`CYPHER_RI_SHADOW_PROGRESS ${summary.evaluations}/${manifest.length * languages.length} ` +
                `${entry.id} ${language} ${artifact.exact ? "exact" : artifact.stage}`);
        }
    }

    write("summary.json", summary);
    console.log("CYPHER_RI_SHADOW_RESULT " + JSON.stringify({...summary, artifactDirectory: outputRoot}));
} finally {
    await VR.srv.stop();
}
