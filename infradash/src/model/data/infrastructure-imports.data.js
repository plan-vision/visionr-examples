function localized(en, de, fr, bg) {
    return {
        "en-US": en,
        "de-DE": de,
        "fr-FR": fr,
        "bg-BG": bg
    };
}

function defineImportFile(code, source, name) {
    return vr.defineDocument({
        code: code,
        source: source,
        folder: "/infra/import",
        folderName: localized(
            "Infrastructure imports",
            "Infrastrukturimporte",
            "Imports d’infrastructure",
            "Импорти на инфраструктура"
        ),
        schema: "documents.file",
        name: name,
        version: "1.0",
        access: {
            read: "administrators",
            owner: "administrators",
            mutate: "administrators"
        }
    });
}

function defineXlsxImport(code, file, name, description, template) {
    vr.defineObject({
        SCHEMA: "core.data_import_xls",
        code: code,
        values: {
            name: name,
            description: description,
            data_file: file,
            header_row: 1,
            start_row: 2,
            template: template,
            is_use_events: true,
            status: {
                SCHEMA: "core.status_data_exchange",
                code: "active",
                mode: "lookup"
            }
        }
    });
}

const cityFile = defineImportFile(
    "infra-europe-cities.xlsx",
    "share/documents/infra/import/europe-cities.xlsx",
    localized(
        "European cities import data",
        "Importdaten europäischer Städte",
        "Données d’import des villes européennes",
        "Данни за импорт на европейски градове"
    )
);

defineXlsxImport(
    "infra.001.cities.europa",
    cityFile,
    localized(
        "01 · Import European cities",
        "01 · Europäische Städte importieren",
        "01 · Importer les villes européennes",
        "01 · Импорт на европейски градове"
    ),
    localized(
        "Creates or updates library.city records and resolves their countries.",
        "Erstellt oder aktualisiert library.city und ordnet die Länder zu.",
        "Crée ou met à jour library.city et associe les pays.",
        "Създава или обновява library.city и свързва държавите."
    ),
    `
<§
const code = data.CODE?.trim();
const name = data.NAME?.trim();
const countryCode = data.COUNTRY_CODE?.trim();
if (code && name && countryCode) {
§>
<object code="<§= code §>" module="library" objectdef="city">
    <name><value><en-US><§= name §></en-US></value></name>
    <country>
        <value>
            <object mode="lookup" module="library" objectdef="country"
                cond="code='<§= countryCode §>'"/>
        </value>
    </country>
</object>
<§ } §>
`
);

const dataCenterFile = defineImportFile(
    "infra-data-centers.xlsx",
    "share/documents/infra/import/data-centers.xlsx",
    localized(
        "Data center import data",
        "Rechenzentrum-Importdaten",
        "Données d’import des centres de données",
        "Данни за импорт на центрове за данни"
    )
);

defineXlsxImport(
    "infra.002.data-centers",
    dataCenterFile,
    localized(
        "02 · Import data centers",
        "02 · Rechenzentren importieren",
        "02 · Importer les centres de données",
        "02 · Импорт на центрове за данни"
    ),
    localized(
        "Depends on stage 001 cities and creates physical data-center locations.",
        "Benötigt Städte aus Stufe 001 und erstellt Rechenzentrumsstandorte.",
        "Dépend des villes de l’étape 001 et crée les sites de centres de données.",
        "Зависи от градовете от етап 001 и създава центрове за данни."
    ),
    `
<§
const code = data.CODE?.trim();
const name = data.NAME?.trim();
const country = data.COUNTRY_CODE?.trim();
const city = data.CITY_CODE?.trim();
if (code && name && country && city) {
§>
<object code="<§= code §>" module="infra" objectdef="colocation">
    <name><value><en-US><§= name §></en-US></value></name>
    <country><value><object mode="lookup" module="library" objectdef="country"
        cond="code='<§= country §>'"/></value></country>
    <city><value><object mode="lookup" module="library" objectdef="city"
        cond="code='<§= city §>'"/></value></city>
    <address><value><§= data.ADDRESS?.trim() §></value></address>
    <timezone><value><§= data.TIMEZONE?.trim() §></value></timezone>
    <status><value><object mode="lookup" module="infra" objectdef="lifecycle_status"
        cond="code='<§= data.STATUS_CODE?.trim() §>'"/></value></status>
</object>
<§ } §>
`
);

const rackFile = defineImportFile(
    "infra-racks.xlsx",
    "share/documents/infra/import/racks.xlsx",
    localized(
        "Rack import data",
        "Rack-Importdaten",
        "Données d’import des baies",
        "Данни за импорт на шкафове"
    )
);

defineXlsxImport(
    "infra.003.rack",
    rackFile,
    localized(
        "03 · Import racks",
        "03 · Racks importieren",
        "03 · Importer les baies",
        "03 · Импорт на шкафове"
    ),
    localized(
        "Depends on stage 002 data centers and creates their rack inventory.",
        "Benötigt Rechenzentren aus Stufe 002 und erstellt deren Rack-Bestand.",
        "Dépend des centres de données de l’étape 002 et crée leurs baies.",
        "Зависи от центровете за данни от етап 002 и създава шкафовете им."
    ),
    `
<§
const code = data.CODE?.trim();
const site = data.DATA_CENTER_CODE?.trim();
if (code && site) {
§>
<object code="<§= code §>" module="infra" objectdef="rack">
    <name><value><en-US><§= data.NAME?.trim() §></en-US></value></name>
    <colocation><value><object mode="lookup" module="infra" objectdef="colocation"
        cond="code='<§= site §>'"/></value></colocation>
    <row><value><§= data.ROW?.trim() §></value></row>
    <position><value><§= data.POSITION?.trim() §></value></position>
    <height_units><value><§= data.HEIGHT_UNITS?.trim() §></value></height_units>
    <power_capacity_w><value><§= data.POWER_CAPACITY_W?.trim() §></value></power_capacity_w>
    <power_draw_w><value><§= data.POWER_DRAW_W?.trim() §></value></power_draw_w>
    <status><value><object mode="lookup" module="infra" objectdef="lifecycle_status"
        cond="code='<§= data.STATUS_CODE?.trim() §>'"/></value></status>
</object>
<§ } §>
`
);

const serverFile = defineImportFile(
    "infra-server-components.xlsx",
    "share/documents/infra/import/server-components.xlsx",
    localized(
        "Server component inventory import data",
        "Importdaten für Serverkomponenten",
        "Données d’import de l’inventaire des serveurs",
        "Данни за импорт на сървърни компоненти"
    )
);

defineXlsxImport(
    "infra.004.component",
    serverFile,
    localized(
        "04 · Import server components",
        "04 · Serverkomponenten importieren",
        "04 · Importer les composants serveur",
        "04 · Импорт на сървърни компоненти"
    ),
    localized(
        "Depends on stage 003 racks and creates the server inventory placed in them.",
        "Benötigt Racks aus Stufe 003 und erstellt den darin platzierten Serverbestand.",
        "Dépend des baies de l’étape 003 et crée l’inventaire des serveurs.",
        "Зависи от шкафовете от етап 003 и създава сървърния инвентар."
    ),
    `
<§
const code = data.CODE?.trim();
const rack = data.RACK_CODE?.trim();
if (code && rack) {
§>
<object code="<§= code §>" module="infra" objectdef="server">
    <name><value><en-US><§= data.NAME?.trim() §></en-US></value></name>
    <asset_tag><value><§= data.ASSET_TAG?.trim() §></value></asset_tag>
    <serial_number><value><§= data.SERIAL_NUMBER?.trim() §></value></serial_number>
    <device_model><value><object mode="lookup" module="infra" objectdef="device_model"
        cond="code='<§= data.DEVICE_MODEL_CODE?.trim() §>'"/></value></device_model>
    <rack><value><object mode="lookup" module="infra" objectdef="rack"
        cond="code='<§= rack §>'"/></value></rack>
    <rack_position><value><§= data.RACK_POSITION?.trim() §></value></rack_position>
    <status><value><object mode="lookup" module="infra" objectdef="lifecycle_status"
        cond="code='<§= data.STATUS_CODE?.trim() §>'"/></value></status>
    <environment><value><§= data.ENVIRONMENT?.trim() §></value></environment>
    <ip_address><value><§= data.IP_ADDRESS?.trim() §></value></ip_address>
    <cpu_cores><value><§= data.CPU_CORES?.trim() §></value></cpu_cores>
    <memory_gb><value><§= data.MEMORY_GB?.trim() §></value></memory_gb>
    <storage_gb><value><§= data.STORAGE_GB?.trim() §></value></storage_gb>
    <installed_at><value><§= data.INSTALLED_AT?.trim() §></value></installed_at>
    <warranty_until><value><§= data.WARRANTY_UNTIL?.trim() §></value></warranty_until>
</object>
<§ } §>
`
);

const assetFile = defineImportFile(
    "infra-server-assets.xlsx",
    "share/documents/infra/import/server-assets.xlsx",
    localized(
        "Installed server asset import data",
        "Importdaten installierter Serverbauteile",
        "Données d’import des actifs serveur installés",
        "Данни за импорт на инсталирани сървърни активи"
    )
);

defineXlsxImport(
    "infra.005.server-assets",
    assetFile,
    localized(
        "05 · Import installed server assets",
        "05 · Installierte Serverbauteile importieren",
        "05 · Importer les actifs serveur installés",
        "05 · Импорт на инсталирани сървърни активи"
    ),
    localized(
        "Depends on stage 004 servers and creates their installed components.",
        "Benötigt Server aus Stufe 004 und erstellt deren installierte Bauteile.",
        "Dépend des serveurs de l’étape 004 et crée leurs composants installés.",
        "Зависи от сървърите от етап 004 и създава инсталираните им компоненти."
    ),
    `
<§
const code = data.CODE?.trim();
const server = data.SERVER_CODE?.trim();
if (code && server) {
§>
<object code="<§= code §>" module="infra" objectdef="component">
    <name><value><en-US><§= data.NAME?.trim() §></en-US></value></name>
    <server><value><object mode="lookup" module="infra" objectdef="server"
        cond="code='<§= server §>'"/></value></server>
    <component_type><value><§= data.COMPONENT_TYPE?.trim() §></value></component_type>
    <serial_number><value><§= data.SERIAL_NUMBER?.trim() §></value></serial_number>
    <capacity><value><§= data.CAPACITY?.trim() §></value></capacity>
    <status><value><object mode="lookup" module="infra" objectdef="lifecycle_status"
        cond="code='<§= data.STATUS_CODE?.trim() §>'"/></value></status>
</object>
<§ } §>
`
);
