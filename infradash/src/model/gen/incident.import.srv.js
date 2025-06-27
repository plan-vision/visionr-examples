const data = require('../../srv/incidents.data')

const url = "https://in2.plan-vision.com/manifest.json";

// var res = JSON.parse(JSCORE.Exec.evalVSC(`
//  (function(){
//   var xhr f = new java.net.XMLttpRequest();
//   xhr.initSSLTrustAll();
//   xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
//   xhr.open("GET", ${JSON.stringify(url)});
//   return xhr.send();
//  })();
// `));

// require('infra/incident.import.srv').test()

console.log('Starting incident import...');

exports.test = function () {
    debugger;

    data.forEach(incidat => {
        try {
            let inci = db.infra.incident.SELECT('code=:CODE', {CODE: incidat.code})[0];

            if (inci) {
                console.log(`Updating existing incident: ${incidat.code}`);
            } else {
                inci = new db.infra.incident();
                inci.code = incidat.code;
                console.log(`Creating new incident: ${incidat.code}`);
            }

            inci.severity = incidat.severity;
            inci.reported_date = new Date(incidat.reported_date);
    
            if (incidat.reported_data) {
                inci.reported_data = JSON.stringify(incidat.reported_data);
            }
            inci.status = 'open';

            const sinst = db.infra.server.byCode(incidat.server);

            if (sinst) {
                inci.server = sinst;
            } else {
                console.warn(`Server with code '${incidat.server}' not found for incident '${incidat.code}'. `);
            }

            console.log(`Successfully processed incident: ${inci.code}`);
        } catch (e) {
            console.error(`Error importing incident ${incidat.code || incidat.id}: ${e.message}`);
        }
    });

    console.log('Incident import finished.');

    bawbawbaw;
}

