/* define i18n messages */
vr.defineI18n(require('./infra.i18n.json'));

/* define module */
vr.defineModule('infra',{
	//sortId : 1000
	alias : 'infra',
	objectdefs : {
		colocation: require("./schema/colocation"), 
		server: require("./schema/server"), 
		rack: require("./schema/rack"),
		service: require("./schema/service")  
	},
	version : '1.2'
});

require("./data/colocation.data");
require("./data/rack.data");
require("./data/server.data");
require("./data/service.data");
