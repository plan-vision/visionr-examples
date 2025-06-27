const fs = require("fs");
const path = require("path");

const serverDataPath = path.join(__dirname, "..", "model", "data", "server.data.js");
const incidentDataOutputPath = path.join(__dirname, "incidents.data.json");

try {
    const serverData = fs.readFileSync(serverDataPath, "utf8");
    const serverCodes = [];
    const regex = /code: \'(SR\\d+)\'/g;
    let match;
    while ((match = regex.exec(serverData)) !== null) {
        serverCodes.push(match[1]);
    }

    const incidentStatuses = ["open", "in_progress", "resolved", "closed"];
    const incidentSeverities = ["low", "medium", "high", "critical"];

    const incidents = [];
    for (let i = 1; i <= 100; i++) {
        const incident = {
            id: i,
            code: `INC-${String(i).padStart(3, "0")}`,
            name: { "en-US": `Incident ${i}` },
            description: { "en-US": `Description for incident ${i}.` },
            status: incidentStatuses[Math.floor(Math.random() * incidentStatuses.length)],
            severity: incidentSeverities[Math.floor(Math.random() * incidentSeverities.length)],
            reported_date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            reported_data: JSON.stringify({
                detail: `Random detail for incident ${i}`,
                value: Math.floor(Math.random() * 100)
            })
        };

        // Assign server ID for a portion of incidents
        if (i % 5 === 0 && serverCodes.length > 0) { // Assign to 20% of incidents
            incident.server = serverCodes[Math.floor(Math.random() * serverCodes.length)];
        } else {
            // For others, use a generic server ID or a random server code
            incident.server = `SR${Math.floor(Math.random() * 20) + 1}`; // Random server code
        }
        incidents.push(incident);
    }

    fs.writeFileSync(incidentDataOutputPath, JSON.stringify(incidents, null, 4));
    console.log("Generated 100 incidents and saved to infradash/src/srv/incidents.data.json");

} catch (error) {
    console.error("Error generating incidents:", error);
    process.exit(1);
}
