module.exports = {     
	'greeting' : { /* define schema (objectdef) by code 'greeting', full key would be 'demo.greeting' */
		properties : {
			'code' : 'code.unique', /* use template @visionr/model/core.property/core.unique | see https://github.com/plan-vision/visionr-engine/blob/master/components/model/core.property/code.unique.js */
			'description' : false /* false means : do not use default property api 'description' | see https://github.com/plan-vision/visionr-engine/blob/master/components/model/core.objectdef/default.js#L200  */ 
		},
		icon : 'favorite' /* icon api : use material symbol icon, support for complex layouting or simple icons | see https://github.com/plan-vision/visionr-engine/blob/master/components/model/generate-engine-icons.js */
	}
}
	