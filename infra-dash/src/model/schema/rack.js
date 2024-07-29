vr.defineI18n(require('./rack.i18n.json'));

module.exports = {
    icon: 'server',
    properties: {
        /* BY CATEGORY */
        'main.basic': {
            'objectdef': 'objectdef.hidden',
            'icon': false,
            'sort_id': 'sortid.hidden',
            'colocation': {
                template: 'relation.obligatory',
                related: 'infra.colocation'
            },
            'name': {
                template: 'text.i18n',
            },
            'model': {
                template: 'text'
            },
            'serial_number': {
                template: 'text'
            },
            'height': {
                template: 'integer',
                unit: 'U'
            },
            'max_power': {
                template: 'integer',
                unit: 'W'
            },
            'status': {
                template: 'option.obligatory',
                optionSet: {
                    code: 'rack_status',
                    options: ['operational', 'maintenance', 'offline']
                },
            },
            'last_maintained': {
                template: 'date'
            },
            'servers': {
                template: 'relation',
                parent: 'infra.server.rack'
            }
        },
        'main.readings': {
            'current_power_usage': {
                template: 'integer',
                unit: 'W',
                readonly: true
            },
            'temperature': {
                template: 'double',
                unit: '°C',
                readonly: true
            },
            'humidity': {
                template: 'double',
                unit: '%',
                readonly: true
            },
            'last_reading_time': {
                template: 'datetime',
                readonly: true
            }
        }
    },
    events: {

    },
    forms: {

    },
    api: {

    }
}