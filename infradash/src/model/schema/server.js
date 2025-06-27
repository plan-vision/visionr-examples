vr.defineI18n(require('./server.i18n.json'));

module.exports = {
	icon: 'folder_special',
	hierarchies: [
		{
			name: {
				"en-US": "By colocation and rack",
				"fr-FR": "Par colocation et rack",
				"bg-BG": "По колокация и rack",
				"de-DE": "Nach Colocation und Rack"
			},
			code: 'infra.colocation.racks.servers',
			path: 'infra.colocation.racks.servers',
			showElementCount: true,
			// defaultRecursive: true,
			// expandInitialDepth: 4,
			// showLeafs: true
		},

	],
	properties: {
		/* BY CATEGORY */
		'main.basic': {
			'objectdef': 'objectdef.hidden',
			'icon': false,
			'sort_id': 'sortid.hidden',
			'rack': {
				template: 'relation.obligatory',
				related: 'infra.rack',
				events: {
					'insert,update'() {
						console.log('Server rack insert/update event triggered.');
						for(const c of this.components) {
							c.colocation = this.rack.colocation;
							console.log(`Component ${c.name} colocation updated to ${c.colocation}`);
						}
					},
					delete() {
						console.log('Server rack delete event triggered.');
						for(const c of this.components) {
							c.colocation = undefined;
							console.log(`Component ${c.name} colocation set to undefined`);
						}
					}
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
			'cpu_count': {
				template: 'integer',
				default: 1
			},
			'cpu_speed': {
				template: 'integer',
				unit: 'MHz'
			},
			'memory': {
				template: 'integer',
				unit: 'GB'
			},
			'storage': {
				template: 'text'
			},
			'status': {
				template: 'option.obligatory',
				optionSet: {
					code: 'server_status',
					options: ['online', 'offline', 'booting', 'stopping', 'error', 'poweroff']
				},
			},
			'last_updated': {
				template: 'datetime'
			},
			'physical_admin': {
				template: 'relation',
				related: 'contacts.employee'
			},
			'vendor': {
				template: 'relation',
				related: 'contacts.vendor'
			},
			'services': {
				template: 'relation',
				parent: 'infra.service.server'
			},
			'incidents': {
				template: 'relation',
				parent: 'infra.incident.server'
			},
			'components': {
				template: 'relation',
				parent: 'infra.component.server'
			},
		}
	},
	events: {

	},
	forms: {
		viewParams: {
			// Define the table view parameters
			table: {
				columns: "icon, name, model, serial_number, cpu_count, cpu_speed, memory, storage, status, last_updated, physical_admin, vendor"
			},
		},
	},

	api: {

	}
}
