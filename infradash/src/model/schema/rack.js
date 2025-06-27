vr.defineI18n(require('./rack.i18n.json'));

/*

db.infra.colocation.COUNT()

db.infra.colocation.VSQL("COUNT(racks)")

db.infra.rack.COUNT("id IN (SELECT racks FROM infra.colocation)")

db.infra.rack.VSQL({select: 'code', where: ' id IN (SELECT racks.id FROM infra.colocation)' })

*/

module.exports = {
    icon: 'dns',
    properties: {
        /* BY CATEGORY */
        'main.basic': {
            'objectdef': 'objectdef.hidden',
            'icon': false,
            'sort_id': 'sortid.hidden',
            'colocation': {
                template: 'relation.obligatory',
                related: 'infra.colocation',
                events: {
                    'insert,update'() {
                        console.log('Rack colocation insert/update event triggered.');
                        for (const serv of this.servers || []) {
                            for (const comp of serv.components || []) {
                                comp.colocation = this.colocation;
                                console.log(`Component ${comp.name} colocation updated to ${this.colocation}`);
                            }
                        }
                    },
                    delete() {
                        console.log('Rack colocation delete event triggered.');
                        for (const serv of this.OLD.servers || []) {
                            for (const comp of serv.components || []) {
                                comp.colocation = undefined;
                                console.log(`Component ${comp.name} colocation set to undefined`);
                            }
                        }
                    },
                }
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
        delete() {
            console.log('Rack top-level delete event triggered.');
            for (const serv of this.OLD.servers || []) {
                for (const comp of serv.components || []) {
                    comp.colocation = undefined;
                    console.log(`Component ${comp.name} colocation set to undefined`);
                }
            }
        },
    },
    forms: {

    },
    api: {

    }
}
