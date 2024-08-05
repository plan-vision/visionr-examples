vr.defineI18n(require('./service.i18n.json'));

// for (var v of db.core.hierarchy.SELECT("path like 'infra%'")) { console.log([v.path, v.code, v.name]) };  
 
module.exports = {
    icon: 'cloud',
    hierarchies: [
        {
            name: {
                "en-US": "By Server",
                "fr-FR": "Par Serveur",
                "bg-BG": "По Сървър",
                "de-DE": "Nach Server"
            },
            code: 'infra.colocation.racks.servers.services',
            path: 'infra.colocation.racks.servers.services',
            showElementCount: true,
            // defaultRecursive: true,
            // expandInitialDepth: 4,
            // showLeafs: true
        }
    ],
    selectFromHierarchy: true,
    properties: {
        'main.basic': {
            'objectdef': 'objectdef.hidden',
            'icon': false,
            'sort_id': 'sortid.hidden',
            'name': {
                template: 'text.i18n',
            },
            'description': {
                template: 'text.i18n',
            },
            'type': {
                template: 'option.obligatory',
                optionSet: {
                    code: 'service_type',
                    options: ['web', 'database', 'application', 'cache', 'monitoring', 'other']
                },
            },
            'status': {
                template: 'option.obligatory',
                optionSet: {
                    code: 'service_status',
                    options: ['active', 'inactive', 'maintenance', 'deprecated']
                },
            },
            'version': {
                template: 'text'
            },
            'server': {
                template: 'relation',
                related: 'infra.server',
                // multiple: true
            },
            'owner': {
                template: 'relation',
                related: 'contacts.employee'
            },
            'last_updated': {
                template: 'datetime'
            },
            'port': {
                template: 'integer'
            },
            'url': {
                template: 'text'
            },
            'dependencies': {
                template: 'relation',
                related: 'infra.service',
                multiple: true
            }
        }
    },
    uniques: [
        ['url', 'port']
    ],
    events: {

    },
    forms: {
        viewParams: {
            table: {
                columns: "icon, name, owner, description, type, status, version, server, last_updated, port, url"
            },
        },
    },
    api: {

    }
}