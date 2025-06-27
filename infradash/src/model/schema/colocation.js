vr.defineI18n(require('./colocation.i18n.json'));

module.exports = {
	icon: 'folder_special',
	properties:
	{
		/* BY CATEGORY */
		'main.basic' :
		{
			'objectdef': 'objectdef.hidden',
			'icon': false,
			'sort_id': 'sortid.hidden',
			'country': {
				template: 'relation.obligatory',
				related: 'library.country'
			},
            'racks': {
                template: 'relation',
                parent: 'infra.rack.colocation'
            },
            'components': {
                template: 'relation',
                parent: 'infra.component.colocation'
            }
        }
    },
	
	// },
	// api: {

	// }
}
