function ref(schema, code) {
    return {SCHEMA: schema, code: code};
}

function define(schema, code, values, propertyModes) {
    vr.defineObject({
        SCHEMA: schema,
        code: code,
        values: values
    }, propertyModes);
}

[
    ["planned", "Planned", "Geplant", "Planifié", "Планиран", "#6E94FF66"],
    ["active", "Active", "Aktiv", "Actif", "Активен", "#4F9D6966"],
    ["maintenance", "Maintenance", "Wartung", "Maintenance", "Поддръжка", "#F2A93B66"],
    ["retired", "Retired", "Stillgelegt", "Retiré", "Изведен", "#8A8F9866"]
].forEach(function(status) {
    define("infra.lifecycle_status", status[0], {
        name: {"en-US": status[1], "de-DE": status[2], "fr-FR": status[3], "bg-BG": status[4]},
        color: status[5]
    });
});

[
    ["open", "Open", "Offen", "Ouvert", "Отворен", "#D6454566"],
    ["investigating", "Investigating", "In Untersuchung", "En investigation", "Разследва се", "#F2A93B66"],
    ["resolved", "Resolved", "Behoben", "Résolu", "Разрешен", "#4F9D6966"],
    ["closed", "Closed", "Geschlossen", "Fermé", "Затворен", "#8A8F9866"]
].forEach(function(status) {
    define("infra.incident_status", status[0], {
        name: {"en-US": status[1], "de-DE": status[2], "fr-FR": status[3], "bg-BG": status[4]},
        color: status[5]
    });
});

[
    ["low", "Low", "Niedrig", "Faible", "Ниска", "#6E94FF66", 10],
    ["medium", "Medium", "Mittel", "Moyenne", "Средна", "#F2C94C66", 20],
    ["high", "High", "Hoch", "Élevée", "Висока", "#F2994A66", 30],
    ["critical", "Critical", "Kritisch", "Critique", "Критична", "#D6454566", 40]
].forEach(function(level) {
    define("infra.impact_level", level[0], {
        name: {"en-US": level[1], "de-DE": level[2], "fr-FR": level[3], "bg-BG": level[4]},
        color: level[5],
        sort_order: level[6]
    });
});

define("infra.vendor", "DELL", {
    name: {"en-US": "Dell Technologies", "de-DE": "Dell Technologies", "fr-FR": "Dell Technologies", "bg-BG": "Dell Technologies"},
    website: "https://www.dell.com",
    support_email: "datacenter-support@example.com"
});
define("infra.vendor", "HPE", {
    name: {"en-US": "Hewlett Packard Enterprise", "de-DE": "Hewlett Packard Enterprise", "fr-FR": "Hewlett Packard Enterprise", "bg-BG": "Hewlett Packard Enterprise"},
    website: "https://www.hpe.com",
    support_email: "hardware-support@example.com"
});

define("infra.device_model", "DELL-R760", {
    name: {"en-US": "PowerEdge R760", "de-DE": "PowerEdge R760", "fr-FR": "PowerEdge R760", "bg-BG": "PowerEdge R760"},
    vendor: ref("infra.vendor", "DELL"),
    model_number: "R760",
    form_factor: "Rack server",
    rack_units: 2
});
define("infra.device_model", "HPE-DL380-G11", {
    name: {"en-US": "ProLiant DL380 Gen11", "de-DE": "ProLiant DL380 Gen11", "fr-FR": "ProLiant DL380 Gen11", "bg-BG": "ProLiant DL380 Gen11"},
    vendor: ref("infra.vendor", "HPE"),
    model_number: "DL380 Gen11",
    form_factor: "Rack server",
    rack_units: 2
});

define("infra.colocation", "AMS1", {
    name: {"en-US": "Amsterdam Primary Data Center", "de-DE": "Primäres Rechenzentrum Amsterdam", "fr-FR": "Centre de données principal d’Amsterdam", "bg-BG": "Основен център за данни Амстердам"},
    country: ref("library.country", "NL"),
    city: "Amsterdam",
    address: "Science Park 100, Amsterdam",
    timezone: "Europe/Amsterdam",
    status: ref("infra.lifecycle_status", "active")
});
define("infra.colocation", "FRA1", {
    name: {"en-US": "Frankfurt Recovery Data Center", "de-DE": "Recovery-Rechenzentrum Frankfurt", "fr-FR": "Centre de reprise de Francfort", "bg-BG": "Резервен център за данни Франкфурт"},
    country: ref("library.country", "DE"),
    city: "Frankfurt",
    address: "Hanauer Landstrasse 200, Frankfurt",
    timezone: "Europe/Berlin",
    status: ref("infra.lifecycle_status", "active")
});

[
    ["AMS1-A01", "Amsterdam Row A Rack 01", "AMS1", "A", "01", 42, 12000, 7200, "active"],
    ["AMS1-A02", "Amsterdam Row A Rack 02", "AMS1", "A", "02", 42, 12000, 4100, "maintenance"],
    ["FRA1-B01", "Frankfurt Row B Rack 01", "FRA1", "B", "01", 48, 15000, 6300, "active"]
].forEach(function(rack) {
    define("infra.rack", rack[0], {
        name: {"en-US": rack[1], "de-DE": rack[1], "fr-FR": rack[1], "bg-BG": rack[1]},
        colocation: ref("infra.colocation", rack[2]),
        row: rack[3],
        position: rack[4],
        height_units: rack[5],
        power_capacity_w: rack[6],
        power_draw_w: rack[7],
        status: ref("infra.lifecycle_status", rack[8])
    });
});

[
    ["SRV-WEB-01", "Web cluster node 01", "AT-10001", "DELLSN10001", "DELL-R760", "AMS1-A01", 10, "active", "production", "10.20.1.11", 32, 256, 3840],
    ["SRV-WEB-02", "Web cluster node 02", "AT-10002", "DELLSN10002", "DELL-R760", "AMS1-A01", 12, "active", "production", "10.20.1.12", 32, 256, 3840],
    ["SRV-DB-01", "Primary database node", "AT-10003", "HPESN10003", "HPE-DL380-G11", "AMS1-A02", 20, "maintenance", "production", "10.20.2.21", 48, 512, 7680],
    ["SRV-DR-01", "Recovery application node", "AT-20001", "HPESN20001", "HPE-DL380-G11", "FRA1-B01", 14, "active", "production", "10.30.1.31", 32, 256, 3840],
    ["SRV-STG-01", "Staging application node", "AT-10004", "DELLSN10004", "DELL-R760", "AMS1-A01", 16, "active", "staging", "10.20.10.41", 24, 128, 1920]
].forEach(function(server) {
    define("infra.server", server[0], {
        name: {"en-US": server[1], "de-DE": server[1], "fr-FR": server[1], "bg-BG": server[1]},
        asset_tag: server[2],
        serial_number: server[3],
        device_model: ref("infra.device_model", server[4]),
        rack: ref("infra.rack", server[5]),
        rack_position: server[6],
        status: ref("infra.lifecycle_status", server[7]),
        environment: server[8],
        ip_address: server[9],
        cpu_cores: server[10],
        memory_gb: server[11],
        storage_gb: server[12],
        installed_at: "2026-01-15",
        warranty_until: "2029-01-15"
    });
});

[
    ["CMP-DB-NIC-01", "Database network adapter", "SRV-DB-01", "network", "NIC10003", "2 x 25 GbE", "active"],
    ["CMP-DB-DISK-01", "Database storage array", "SRV-DB-01", "storage", "DSK10003", "7.68 TB NVMe", "maintenance"],
    ["CMP-WEB-MEM-01", "Web node memory kit", "SRV-WEB-01", "memory", "MEM10001", "256 GB DDR5", "active"],
    ["CMP-DR-PSU-01", "Recovery node power supply", "SRV-DR-01", "power", "PSU20001", "1600 W redundant", "active"]
].forEach(function(component) {
    define("infra.component", component[0], {
        name: {"en-US": component[1], "de-DE": component[1], "fr-FR": component[1], "bg-BG": component[1]},
        server: ref("infra.server", component[2]),
        component_type: component[3],
        serial_number: component[4],
        capacity: component[5],
        status: ref("infra.lifecycle_status", component[6])
    });
});

define("infra.service", "SVC-DATABASE", {
    name: {"en-US": "Customer database", "de-DE": "Kundendatenbank", "fr-FR": "Base de données clients", "bg-BG": "Клиентска база данни"},
    description: {"en-US": "Primary transactional database service.", "de-DE": "Primärer transaktionaler Datenbankdienst.", "fr-FR": "Service principal de base de données transactionnelle.", "bg-BG": "Основна транзакционна база данни."},
    owner_team: "Data Platform",
    criticality: ref("infra.impact_level", "critical"),
    status: ref("infra.lifecycle_status", "maintenance"),
    servers: [ref("infra.server", "SRV-DB-01"), ref("infra.server", "SRV-DR-01")]
}, {servers: "replace", dependencies: "replace"});

define("infra.service", "SVC-PORTAL", {
    name: {"en-US": "Customer portal", "de-DE": "Kundenportal", "fr-FR": "Portail client", "bg-BG": "Клиентски портал"},
    description: {"en-US": "Public self-service customer portal.", "de-DE": "Öffentliches Self-Service-Kundenportal.", "fr-FR": "Portail client public en libre-service.", "bg-BG": "Публичен портал за самообслужване."},
    owner_team: "Digital Channels",
    criticality: ref("infra.impact_level", "high"),
    status: ref("infra.lifecycle_status", "active"),
    servers: [ref("infra.server", "SRV-WEB-01"), ref("infra.server", "SRV-WEB-02")],
    dependencies: [ref("infra.service", "SVC-DATABASE")]
}, {servers: "replace", dependencies: "replace"});

define("infra.service", "SVC-PORTAL-STG", {
    name: {"en-US": "Customer portal staging", "de-DE": "Kundenportal Staging", "fr-FR": "Préproduction du portail client", "bg-BG": "Предпродукционен клиентски портал"},
    owner_team: "Digital Channels",
    criticality: ref("infra.impact_level", "low"),
    status: ref("infra.lifecycle_status", "active"),
    servers: [ref("infra.server", "SRV-STG-01")],
    dependencies: []
}, {servers: "replace", dependencies: "replace"});

define("infra.incident", "INC-2026-001", {
    name: {"en-US": "Database storage latency", "de-DE": "Latenz des Datenbankspeichers", "fr-FR": "Latence du stockage de la base", "bg-BG": "Латентност на дисковото хранилище"},
    description: {"en-US": "Write latency exceeded the production threshold.", "de-DE": "Die Schreiblatenz überschritt den Produktionsgrenzwert.", "fr-FR": "La latence d’écriture a dépassé le seuil de production.", "bg-BG": "Латентността при запис надвиши прага."},
    status: ref("infra.incident_status", "investigating"),
    severity: ref("infra.impact_level", "critical"),
    reported_at: "2026-07-27T08:15:00.000Z",
    server: ref("infra.server", "SRV-DB-01"),
    service: ref("infra.service", "SVC-DATABASE"),
    assignee: "Data Platform on-call"
});

define("infra.incident", "INC-2026-002", {
    name: {"en-US": "Portal node health check failure", "de-DE": "Fehler bei Portal-Node-Healthcheck", "fr-FR": "Échec du contrôle de santé du portail", "bg-BG": "Неуспешна проверка на портален възел"},
    status: ref("infra.incident_status", "resolved"),
    severity: ref("infra.impact_level", "medium"),
    reported_at: "2026-07-26T13:20:00.000Z",
    resolved_at: "2026-07-26T13:42:00.000Z",
    server: ref("infra.server", "SRV-WEB-02"),
    service: ref("infra.service", "SVC-PORTAL"),
    assignee: "Digital Channels on-call",
    resolution: "Restarted the application worker and replaced its stale configuration."
});

define("infra.incident", "INC-2026-003", {
    name: {"en-US": "Recovery replication delay", "de-DE": "Verzögerung der Recovery-Replikation", "fr-FR": "Retard de réplication de reprise", "bg-BG": "Закъснение на репликацията"},
    status: ref("infra.incident_status", "open"),
    severity: ref("infra.impact_level", "high"),
    reported_at: "2026-07-27T10:05:00.000Z",
    server: ref("infra.server", "SRV-DR-01"),
    service: ref("infra.service", "SVC-DATABASE"),
    assignee: "Infrastructure Operations"
});
