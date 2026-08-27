#!/usr/bin/env vr run

/*
 * Read-only transport/protocol gate for the experimental Cypher-RI Search
 * planner. Raw reasoning remains server-local. The task parses and validates
 * model output but neither lowers nor executes model-authored Cypher.
 */

const connection = "cypher-ri";

try {
    const report = await VR.srv.call(function(configuration) {
        var projectionBuilder = require("server/ai/search-planning-projection");
        var protocol = require("server/ai/search-cypher-ri-protocol");
        var contract = require("server/ai/search-cypher-contract");
        var projection = projectionBuilder.build({
            schema: "courses.student",
            name: "Student",
            inheritance: {root: "courses.student", types: []},
            relations: [{
                path: "courses",
                name: "Courses",
                target: "courses.course",
                direction: "forward",
                cardinality: "many"
            }],
            properties: [
                {path: "code", name: "Code", type: "string"},
                {path: "name", name: "Name", type: "string"},
                {path: "courses.code", name: "Courses / Code", type: "string", relationPath: ["courses"]},
                {path: "courses.name", name: "Courses / Name", type: "string", relationPath: ["courses"]}
            ]
        });
        var question = "Which students are enrolled in courses?";
        var schemas = protocol.schemas(projection, question);
        var selectionPrompt = protocol.selectionPrompt(schemas.simplified, question);
        var selectionResponse = JSON.parse(JSCORE.Exec.completeAI(configuration.connection, JSON.stringify({
            prompt: selectionPrompt,
            max_tokens: 1024,
            stop: protocol.SELECTION_STOP
        })));
        var selectionChoice = selectionResponse.choices && selectionResponse.choices[0];
        var selection = protocol.parseSelection(selectionChoice && selectionChoice.text, schemas.simplified);
        var generationPrompt = protocol.generationPrompt(
            selectionPrompt, selectionChoice.text, schemas.detailed, selection.selected
        );
        var generationResponse = JSON.parse(JSCORE.Exec.completeAI(configuration.connection, JSON.stringify({
            prompt: generationPrompt,
            max_tokens: 2048,
            stop: protocol.ANSWER_STOP
        })));
        var generationChoice = generationResponse.choices && generationResponse.choices[0];
        var cypher = protocol.parseAnswer(generationChoice && generationChoice.text);
        var inspection = JSON.parse(JSCORE.Exec.inspectCypherSearchQuery(cypher));
        var validation = contract.validate(projection, inspection);
        return {
            connection: configuration.connection,
            endpointProtocol: "runpod_vllm_completions",
            model: selectionResponse.model || generationResponse.model || null,
            selectionFinishReason: selectionChoice && selectionChoice.finish_reason || null,
            selected: selection.selected,
            selectionUsage: selectionResponse.usage || null,
            generationFinishReason: generationChoice && generationChoice.finish_reason || null,
            cypher: cypher,
            inspection: {
                accepted: inspection.accepted,
                diagnostics: inspection.diagnostics,
                rootVariable: inspection.rootVariable,
                returnShape: inspection.returnShape,
                topLevelWithCount: inspection.topLevelWithCount,
                withShape: inspection.withShape,
                withSourceVariable: inspection.withSourceVariable,
                withAliasVariable: inspection.withAliasVariable,
                nodeLabels: inspection.nodeLabels,
                relationshipTypes: inspection.relationshipTypes
            },
            projectionValidation: {
                accepted: validation.accepted,
                diagnostics: validation.diagnostics,
                rootVariable: validation.rootVariable,
                normalizations: validation.normalizations
            },
            generationUsage: generationResponse.usage || null
        };
    }, {connection: connection});
    console.log("CYPHER_RI_PROTOCOL_RESULT " + JSON.stringify(report));
} finally {
    await VR.srv.stop();
}
