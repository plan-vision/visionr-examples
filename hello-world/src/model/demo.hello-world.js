/* define i18n messages */
vr.defineI18n(require('./demo.hello-world.i18n.json'));

/* define module */
vr.defineModule('demo',{
	//sortId : 1000
	alias : 'demo',
	objectdefs : [
		require("./schema/greeting") /* include schema definition for greeting */
	],
	version : '1.0001'
});
