vr.defineI18n(require('./server.i18n.json'));

module.exports = {
	icon: 'folder_special',
	properties: {
		/* BY CATEGORY */
		'main.basic': {
		  'objectdef': 'objectdef.hidden',
		  'icon': false,
		  'sort_id': 'sortid.hidden',
		  'rack': {
			template: 'relation.obligatory',
			related: 'infra.rack'
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
			optionSet : {
				code : 'server_status',
				options : ['online','offline','booting','stopping','error','poweroff']
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
