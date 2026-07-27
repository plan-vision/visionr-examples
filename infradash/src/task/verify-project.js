#!/usr/bin/env vr run

try {
    const result = await VR.srv.call(function() {
        const database = db.infra;
        const portal = database.service.byCode("SVC-PORTAL");
        const incident = database.incident.byCode("INC-2026-001");
        const databaseServer = database.server.byCode("SRV-DB-01");

        return {
            lifecycleStatusCount: database.lifecycle_status.COUNT(),
            incidentStatusCount: database.incident_status.COUNT(),
            impactLevelCount: database.impact_level.COUNT(),
            vendorCount: database.vendor.COUNT(),
            deviceModelCount: database.device_model.COUNT(),
            dataCenterCount: database.colocation.COUNT(),
            cityCount: db.library.city.SELECT({
                where: "code IN ('AMSTERDAM','FRANKFURT')"
            }).length,
            amsterdamCountry: String(
                db.library.city.byCode("AMSTERDAM").country.code
            ),
            primaryCity: String(
                database.colocation.byCode("AMS1").city
            ),
            rackCount: database.rack.COUNT(),
            serverCount: database.server.COUNT(),
            componentCount: database.component.COUNT(),
            serviceCount: database.service.COUNT(),
            incidentCount: database.incident.COUNT(),
            portalServerCount: portal && portal.count("servers"),
            portalDependencyCount: portal && portal.count("dependencies"),
            incidentServer: incident && String(incident.server),
            incidentService: incident && String(incident.service),
            databaseSite: databaseServer &&
                String(databaseServer.rack.colocation),
            activeColor: String(
                database.lifecycle_status.byCode("active").color
            ),
            criticalColor: String(
                database.impact_level.byCode("critical").color
            )
        };
    });

    console.log("PROJECT_VERIFY_RESULT " + JSON.stringify(result));

    const expected = {
        lifecycleStatusCount: 4,
        incidentStatusCount: 4,
        impactLevelCount: 4,
        vendorCount: 2,
        deviceModelCount: 2,
        dataCenterCount: 2,
        cityCount: 2,
        amsterdamCountry: "NL",
        primaryCity: "Amsterdam",
        rackCount: 3,
        serverCount: 5,
        componentCount: 4,
        serviceCount: 3,
        incidentCount: 3,
        portalServerCount: 2,
        portalDependencyCount: 1,
        incidentServer: "Primary database node",
        incidentService: "Customer database",
        databaseSite: "Amsterdam Primary Data Center",
        activeColor: "#4F9D6966",
        criticalColor: "#D6454566"
    };

    Object.keys(expected).forEach(function(key) {
        if (result[key] !== expected[key])
            throw new Error("Unexpected " + key + ": " +
                JSON.stringify(result));
    });
} finally {
    await VR.srv.stop();
}
