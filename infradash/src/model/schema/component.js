vr.defineI18n(require('./component.i18n.json'));

module.exports = {
    icon: 'extension', // A generic icon for components
    properties: {
        /* BY CATEGORY */
        'main.basic': {
            'objectdef': 'objectdef.hidden',
            'icon': false,
            'sort_id': 'sortid.hidden',
            'serial_number': {
                template: 'code.unique' // Implied by template, and should be unique
            },
            'server': {
                template: 'relation', // Not mandatory
                related: 'infra.server',
                events: {
                    'insert,update'() {
                        console.log('Component server insert/update event triggered.');
                        this.colocation = this.server.rack.colocation;
                        console.log(`Component colocation updated to ${this.colocation}`);
                    }
                }
            },
            'colocation': {
                template: 'relation', // Optional colocation reference for flying parts
                related: 'infra.colocation',
                events: {
                    'insert,update'() {
                        console.log('Component colocation insert/update event triggered.');
                        if (this.server?.rack?.colocation?.id != this.colocation.id) {
                            this.server=undefined;
                            console.log('Component server set to undefined due to colocation mismatch.');
                        }
                    },
                    delete() {
                        console.log('Component colocation delete event triggered.');
                        this.server = undefined;
                        console.log('Component server set to undefined due to colocation deletion.');
                    }
                }
            },
            'is_operational': {
                template: 'boolean.obligatory.default.false' // Default to false if not in a server
            },
            'comment': {
                template: 'text'
            },
            'vendor': {
                template: 'text'
            },
            'model': {
                template: 'text'
            }
        }
    },
    events: {
        
    },
    forms: {
        viewParams: {
            table: {
                columns: "icon, serial_number, server, colocation, is_operational, vendor, model, comment"
            }
        }
    },
    api: {

    }
};
