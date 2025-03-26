module.exports = {     
	'greeting' : { /* define schema (objectdef) by code 'greeting', full key would be 'demo.greeting' */
		properties : {
			'code' : 'code.unique', /* use template @visionr/model/core.property/core.unique | see https://github.com/plan-vision/visionr-engine/blob/master/components/model/core.property/code.unique.js */
			'description' : false, /* false means : do not use default property api 'description' | see https://github.com/plan-vision/visionr-engine/blob/master/components/model/core.objectdef/default.js#L200  */ 
			'var1'  : 'varchar',
			'txt1'  : 'text',
			'int1' : 'integer',
			'dbl1' : 'double',
			'dtm1' : 'datetime',
			'dtm2' : 'millis',
			'dtm3' : 'date',
			'dtm4' : 'time',
			'dtm5' : 'hoursmins',
			'dtm6' : 'daymonth',
			'opt1' : 'boolean.obligatory'
		},
		forms : 
		{
			viewParams : 
			{
				table : {
					columns : "code,name@200,description@200,var1,txt1@200,int1,dbl1,dtm1,dtm2,dtm3,dtm4,dtm5,dtm6,opt1"
				}
			}
		},
		icon : 'favorite' /* icon api : use material symbol icon, support for complex layouting or simple icons | see https://github.com/plan-vision/visionr-engine/blob/master/components/model/generate-engine-icons.js */
	}
}
	