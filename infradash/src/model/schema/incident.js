vr.defineI18n(require('./incident.i18n.json'));

module.exports = {
	icon: 'error',
	hierarchies: [
        {
            name: {
                "en-US": "By Server",
                "fr-FR": "Par Serveur",
                "bg-BG": "По Сървър",
                "de-DE": "Nach Server"
            },
            code: 'infra.collocation.server.incidents',
            path: 'infra.collocation.server.incidents',
            showElementCount: true,
        },
    ],
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
		  'status': {
			template: 'option.obligatory',
			optionSet : {
				code : 'incident_status',
				options : ['open','in_progress','resolved','closed']
			},
		  },
		  'severity': {
			template: 'option.obligatory',
			optionSet : {
				code : 'incident_severity',
				options : ['low','medium','high','critical']
			},
		  },
		  'reported_date': {
			template: 'datetime'
		  },
		  'reported_data': {
			template: 'text'
		  },
		  'server': {
			template: 'relation',
			related: 'infra.server'
		  },
		}
	  },
	events: {

	},
	forms: {
		viewParams: {
			table: {
				columns: "icon, name, status, severity, reported_date, server"
			},
		},
	},

	api: {

	}
}
