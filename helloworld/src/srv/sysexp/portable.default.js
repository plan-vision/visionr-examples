module.exports = function(env) {
	//-------------------------------------------------------------------------------------
	var exp = require('server/sysexp/defs/built-in.modules')({
		...env /* options */
	}); 
	//-------------------------------------------------------------------------------------
	// ALL of demo 
	for (var od of db.demo) {
		exp.includeSchema(od,"*")
		for (var e of od.SELECT()) 
			exp.exportObject(e);
	} 
	return exp;
}
