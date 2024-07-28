/* define i18n messages */
vr.defineI18n(require('./infra.i18n.json'));

/* define module */
vr.defineModule('infra',{
	//sortId : 1000
	alias : 'infra',
	objectdefs : {
		colocation: require("./schema/colocation"), 
		server: require("./schema/server"), 
		rack: require("./schema/rack") 
	},
	version : '1.0001'
});

require("./data/infra-min.data");
require("./data/server.data");
require("./data/rack.data");
