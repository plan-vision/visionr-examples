/* define i18n messages */
vr.defineI18n(require('./infra.i18n.json'));
vr.defineI18n(require("./infra.model.i18n.json"));

/* define module */
vr.defineModule('infra',{
	//sortId : 1000
	alias : 'infra',
	objectdefs : {
		colocation: require("./schema/colocation.model"),
		rack: require("./schema/rack.model"),
		vendor: require("./schema/vendor.model"),
		device_model: require("./schema/device_model.model"),
		lifecycle_status: require("./schema/lifecycle_status.model"),
		incident_status: require("./schema/incident_status.model"),
		impact_level: require("./schema/impact_level.model"),
		server: require("./schema/server.model"),
		component: require("./schema/component.model"),
		service: require("./schema/service.model"),
		incident: require("./schema/incident.model"),
	},
	version : '1.2'
});

require("./data/infrastructure.data");


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
