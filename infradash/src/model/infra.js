/* define i18n messages */
vr.defineI18n(require('./infra.i18n.json'));

/* define module */
vr.defineModule('infra',{
	//sortId : 1000
	alias : 'infra',
	objectdefs : {
		component: require("./schema/component"),
		colocation: require("./schema/colocation"), 
		incident: require("./schema/incident"),
		server: require("./schema/server"), 
		rack: require("./schema/rack"),
		service: require("./schema/service"),
	},
	version : '1.2'
});

require("./data/colocation.data");
require("./data/rack.data");
require("./data/server.data");
require("./data/service.data");
require("./data/incident.data");


/* 

- creation mask
- incident propagation
- incident calendar
- maintenance calendar
- dashboard by errors
- last month errors
- all status by type barchart


- spare parts

- racks and servers instance of inventory

*/
