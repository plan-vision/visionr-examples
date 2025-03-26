# Infradash Schema Definition Guide for GPT Transpilation

## 1. What is a schema and how VisionR approaches it

In VisionR, a schema defines the structure and characteristics of data objects within an application. It acts as a blueprint, specifying the properties, relationships, and behaviors of entities. VisionR approaches schema definition in a declarative and modular way, using JavaScript files and JSON configurations to create flexible and maintainable data models. Schemas in VisionR are not just about data structure; they also encompass aspects like internationalization (i18n), user interface forms (forms - though not yet implemented in detail in the example), and API interactions. The Infradash schemapull
, as described in this guide, exemplifies this approach for modeling infrastructure components.

## 2. Defining objectdefs

In VisionR schemas, "objectdefs" (object definitions) are the core building blocks for defining entity types. They are defined as JavaScript modules that export a configuration object. This object specifies various aspects of the entity, including its properties, relationships, hierarchies, and more.

### - Property types

VisionR provides a rich set of property types, implemented as templates, to define the characteristics of data fields. Here are some key property types used in the Infradash schema:

*   **`text`**: Represents simple text strings. Example: `model` property in `rack.js`.
*   **`text.i18n`**: Represents internationalized text strings, supporting multiple languages. Example: `name` property in `rack.js`. Translations are stored in corresponding `.i18n.json` files.
*   **`integer`**: Represents integer numbers, optionally with a `unit`. Example: `height` and `max_power` in `rack.js`, `cpu_count` and `cpu_speed` in `server.js`.
*   **`double`**: Represents floating-point numbers, optionally with a `unit`. Example: `temperature` and `humidity` in `rack.js`.
*   **`date`**: Represents date values. Example: `last_maintained` in `rack.js`.
*   **`datetime`**: Represents date and time values. Example: `last_reading_time` in `rack.js`, `last_updated` in `server.js` and `service.js`.
*   **`option.obligatory`**: Represents a required option selection from a predefined set of options (using `optionSet`). Example: `status` in `rack.js`, `server.js` and `service.js`, `type` in `service.js`.
*   **`relation` and `relation.obligatory`**: Represent relationships to other objectdefs. Examples: `colocation` and `servers` in `rack.js`, `rack` and `services` in `server.js`, `server` and `dependencies` in `service.js`, `country` and `racks` in `colocation.js`. `relation.obligatory` makes the relationship mandatory.

### - Inheritance

Inheritance in VisionR allows for creating reusable schema components and establishing hierarchical relationships between entities. While not explicitly used in the current Infradash schema, inheritance could be applied in several ways to improve code organization and reusability:

1. **Base Schema Inheritance**: Create common base schemas that can be inherited by multiple entity types. For example, the Infradash schema could benefit from a base `InfrastructureComponent` schema:

```javascript
// infrastructure_component.js (base schema)
module.exports = {
    properties: {
        'main.basic': {
            'name': {
                template: 'text.i18n',
            },
            'model': {
                template: 'text'
            },
            'serial_number': {
                template: 'text'
            },
            'status': {
                template: 'option.obligatory',
                // Status options would be defined in inheriting schemas
            }
        }
    }
}

// rack.js (inheriting schema)
const baseComponent = require('./infrastructure_component');

module.exports = {
    inherits: baseComponent,
    icon: 'server',
    properties: {
        'main.basic': {
            // Additional rack-specific properties
            'colocation': {
                template: 'relation.obligatory',
                related: 'infra.colocation'
            },
            'height': {
                template: 'integer',
                unit: 'U'
            },
            'max_power': {
                template: 'integer',
                unit: 'W'
            },
            // Override the status property to provide rack-specific options
            'status': {
                template: 'option.obligatory',
                optionSet: {
                    code: 'rack_status',
                    options: ['operational', 'maintenance', 'offline']
                },
            }
        },
        // Rack-specific property categories
        'main.readings': {
            // ...
        }
    }
}
```

2. **Specialized Service Types**: The current `service.js` schema could be extended with specialized service types:

```javascript
// web_service.js
module.exports = {
    inherits: 'infra.service',
    icon: 'web',
    properties: {
        'main.web_specific': {
            'domain_name': {
                template: 'text'
            },
            'ssl_enabled': {
                template: 'boolean'
            },
            'web_server_type': {
                template: 'option.obligatory',
                optionSet: {
                    code: 'web_server_type',
                    options: ['nginx', 'apache', 'iis', 'other']
                }
            }
        }
    }
}

// database_service.js
module.exports = {
    inherits: 'infra.service',
    icon: 'database',
    properties: {
        'main.db_specific': {
            'db_type': {
                template: 'option.obligatory',
                optionSet: {
                    code: 'db_type',
                    options: ['mysql', 'postgresql', 'mongodb', 'oracle', 'other']
                }
            },
            'db_version': {
                template: 'text'
            },
            'backup_schedule': {
                template: 'text'
            }
        }
    }
}
```

3. **Monitored Device Pattern**: Create a base schema for devices that need monitoring:

```javascript
// monitored_device.js
module.exports = {
    properties: {
        'main.monitoring': {
            'uptime': {
                template: 'integer',
                unit: 'days'
            },
            'last_check': {
                template: 'datetime'
            },
            'monitoring_agent': {
                template: 'relation',
                related: 'monitoring.agent'
            },
            'alert_threshold': {
                template: 'integer',
                unit: '%'
            }
        }
    }
}
```

4. **Configuration Inheritance**: As seen in the VisionR engine, configuration objects can inherit from parent configurations:

```javascript
"DEVELOPMENT": {
    "code": "DEVELOPMENT",
    "name": "Development Environment",
    "inherits": "DEFAULT",
    "is_devel": true,
    "log_level": "debug"
},
"PRODUCTION": {
    "code": "PRODUCTION",
    "name": "Production Environment",
    "inherits": "DEFAULT",
    "is_devel": false,
    "log_level": "error"
}
```

By applying these inheritance patterns to the Infradash schema, you could create a more modular, maintainable, and extensible data model that better represents the relationships between infrastructure components.

### - Relation types with multiplicity

VisionR's `relation` property type defines relationships between objectdefs. Multiplicity (one-to-one, one-to-many, many-to-many) is implicitly handled through the schema structure and how relations are defined:

*   **One-to-many:** Represented by a `relation` property on the "one" side with a corresponding `parent` property on the "many" side. Example: `colocation.js` has `'racks': { template: 'relation', parent: 'infra.rack.colocation' }`, and `rack.js` has `'colocation': { template: 'relation.obligatory', related: 'infra.colocation' }`. This defines a one-to-many relationship from Colocation to Rack (one Colocation can have many Racks).
*   **Many-to-one:** Represented by a `relation` property without a `parent` on the "many" side, pointing to the "one" side. Example: `rack.js` has `'colocation': { template: 'relation.obligatory', related: 'infra.colocation' }`. This means many Racks belong to one Colocation.
*   **Many-to-many/One-to-one:** While not explicitly shown in the base Infradash schema, many-to-many or one-to-one relationships could be modeled using `relation` properties on both sides, potentially with a `multiple: true` option (though `multiple: true` is commented out in `service.js` for the `server` relation, suggesting it might not be the standard way to handle multiplicity in relations). Deeper investigation into VisionR's relation implementation would be needed to confirm the best practices for many-to-many and one-to-one relationships.

### - Object hierarchies for navigation and visualization

VisionR allows defining hierarchical relationships between objects for navigation and visualization purposes. These hierarchies are separate from object inheritance and are used to create tree-like structures in the UI. Hierarchies are defined at the schema level using the `hierarchies` property:

```javascript
// From server.js
hierarchies: [
    {
        name: {
            "en-US": "By Server",
            "fr-FR": "Par Serveur",
            "bg-BG": "По Сървър",
            "de-DE": "Nach Server"
        },
        code: 'infra.colocation.racks.servers',
        path: 'infra.colocation.racks.servers',
        showElementCount: true,
        // defaultRecursive: true,
        // expandInitialDepth: 4,
        // showLeafs: true
    }
]
```

Key aspects of hierarchies include:

1. **Path and Code Definition**: 
   - The `path` property defines the hierarchical path through related objects, following a dot-notation pattern.
   - The `code` property serves as a unique identifier for the hierarchy, typically matching the path.
   - Both follow the pattern `[module].[entity1].[entity2]...` where:
     - The first segment is the module name (e.g., `infra`)
     - Subsequent segments represent entity types in the hierarchy (e.g., `colocation`, `racks`, `servers`)
   - Each segment in the path corresponds to a relation property in the schema
   - The path reflects the actual relationships between objects in the data model

2. **Internationalized Names**: The `name` property provides translations for the hierarchy name in different languages.

3. **Visualization Options**: Properties like `showElementCount`, `defaultRecursive`, and `expandInitialDepth` control how the hierarchy is displayed in the UI.

4. **Multiple Hierarchies**: An object can participate in multiple hierarchies, allowing for different ways to navigate and visualize the same data.

For example, in the Infradash schema, services are organized in a hierarchy under servers:

```javascript
// From service.js
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
        showElementCount: true
    }
]
```

This creates a complete hierarchy from colocation → rack → server → service, allowing users to navigate through the infrastructure components in a logical way. The path `infra.colocation.racks.servers.services` is constructed by:

1. Starting with the module name (`infra`)
2. Adding each entity type in the hierarchy, separated by dots
3. Following the actual relation properties defined in the schemas:
   - `colocation.js` has a `racks` relation
   - `rack.js` has a `servers` relation
   - `server.js` has a `services` relation

More complex hierarchies can include additional configuration:

```javascript
hierarchies: [
    {
        code: 'system_manager.workplace.projects',
        path: 'system_manager.workplace.projects',
        name: db.MSG('HIERARCHY_SYSMSG_WORKPLACE_PROJECTS'),
        count: true,
        expandInitialDepth: 1,
        schemaSet: [
            'system_manager.workplace',
            'system_manager.project'
        ],
        setupNew: {
            remote: 'sysmgr/project.srv.remote',
            api: 'setHierarchyContextNew'
        }
    }
]
```

In this example:
- `schemaSet` defines which schemas are included in the hierarchy
- `setupNew` configures how new objects are created within the hierarchy context
- `expandInitialDepth` controls the initial expansion level when the hierarchy is displayed

Hierarchies can be used to:

- Create navigation trees in the UI
- Organize data in a dimensional structure
- Reflect real-world relationships between objects
- Provide different views of the same data based on different organizational principles

This is particularly useful in ERP-like applications where data often has complex hierarchical relationships.

### - Different view types and UI customization

VisionR provides multiple ways to define how data is displayed in the UI:

1. **View Types**: Schemas can define multiple view types through the `forms.views` property. Common view types include:
   - `list`: A simple list view of objects
   - `table`: A tabular view with columns
   - `overview`: A detailed view of a single object
   - `edit`: A form for editing an object

2. **Column Configuration**: For table views, you can specify which columns to display and their order using the `forms.viewParams.table.columns` property. For example:

```javascript
forms: {
    viewParams: {
        table: {
            columns: "workplace,relative_path,configuration_active,code,status,name,description",
            limit: 25
        }
    }
}
```

3. **Custom Templates**: Views can use custom templates for rendering:

```javascript
forms: {
    viewParams: {
        overview: {
            templateInner: {
                ref: '/widgets/system_manager/project/overview-inner',
            }
        }
    }
}
```

4. **Responsive Layout**: The edit view can define responsive layouts with different column counts for different screen sizes:

```javascript
forms: {
    viewParams: {
        edit: {
            mediaSizes: {
                xs: 1,  // Extra small screens: 1 column
                sm: 2,  // Small screens: 2 columns
                md: 2,  // Medium screens: 2 columns
                lg: 3,  // Large screens: 3 columns
                xl: 3   // Extra large screens: 3 columns
            }
        }
    }
}
```

5. **Component Integration**: In HTML templates, the `<objectsview>` component renders objects based on their schema. For example, in `helloworld/src/forms/pages/main/live.html`:

```html
<objectsview schema="demo.greeting" live embed menu>
```

This displays objects of type `demo.greeting` with live updates, embedded in the current view, and with a menu for actions.

### - Using events with on_something code props

Event handling in VisionR is implemented through event properties in schema definitions:

1. **Event Declaration**: Events are declared in the `events` section of schema definitions. For example:

```javascript
events : {    
    'insert,update'(){
        if (!db.nestedTransaction) {
            require("sysmgr/workplace.srv").scheduleStateWriteJSON();
            require("sysmgr/project.srv").syncServerHostExternal(this);
        }
    },
    insert() {
        // Code executed when an object is inserted
        if (!db.nestedTransaction && this.workplace?.code && this.relative_path) {
            const json = { id: this.id, workplace: this.workplace?.code, project: this.relative_path };
            db.afterCommit(()=>{
                if (!this.DELETED) /* may be temporary inserted and on commit deleted */
                    JSCORE.Exec.getShellAPI().sendSignal('prj.add', json);    
            });    
        }
    }
}
```

2. **Event Types**: The system supports various event types including:
   - Database lifecycle events: `insert`, `update`, `delete`
   - Combined events: `insert,update` (triggered on either insert or update)
   - Form-related events: `applyChanges`, `applyConstraints`
   - Custom events: These can be defined as needed for specific business logic

3. **Event Context**: Within event handlers, `this` refers to the current object instance, providing access to its properties and methods.

4. **Transaction Awareness**: Event handlers are transaction-aware, with checks like `if (!db.nestedTransaction)` to prevent recursive or duplicate processing.

5. **Asynchronous Operations**: Events can schedule operations to occur after transaction commit using `db.afterCommit()`, ensuring data consistency.

## 3. Working with i18n

Internationalization (i18n) is a core feature of VisionR schemas. It allows for defining labels and options in multiple languages. Key aspects of working with i18n include:

*   **`.i18n.json` files:** Translations are stored in separate JSON files (e.g., `rack.i18n.json`, `server.i18n.json`, `service.i18n.json`) located in the same directory as the schema definition files.
*   **`vr.defineI18n(json)`:** This function, called at the beginning of each schema file, loads the translations from the corresponding `.i18n.json` file and makes them available to the schema.
*   **`text.i18n` template:**  Used for properties that require internationalized labels. The actual translations are defined in the `.i18n.json` file. Example: `'name': { template: 'text.i18n' }` in `rack.js`, with translations in `rack.i18n.json` like `"name": { "en-US": "Name", "fr-FR": "Nom", ... }`.
*   **Option translations:** For `option.obligatory` properties, translations for option labels are also defined in the `.i18n.json` files, using the format `"option:[option code]"`. Example: `"option:operational": { "en-US": "Operational", "fr-FR": "Opérationnel", ... }` in `rack.i18n.json`.

## 4. Working with data instances

Data instances in VisionR are typically created and managed through the user interface. While the `.data.js` files in the `infradash/src/model/data/` directory are currently empty and don't provide examples of data instances, the `helloworld/src/forms/pages/main/live.html` example demonstrates how data instances can be created in the UI. The `<button mat-button (click)="root.createDialog('demo.greeting')">NEW GREETING</button>` line shows a button that, when clicked, opens a dialog to create a new instance of the `demo.greeting` objectdef. This illustrates the dynamic creation of data instances within the VisionR application, driven by schema definitions.

## 5. Constraints and Object Correlations

VisionR provides several mechanisms for defining constraints on values and correlations between objects:

### - Unique Constraints

The `uniques` property in a schema definition specifies which field combinations must be unique across all instances of an object:

```javascript
// From service.js
uniques: [
    ['url', 'port'] // The combination of url and port must be unique
]
```

You can define multiple unique constraints by adding more arrays to the `uniques` array.

### - Validation Functions

Custom validation logic can be implemented in server-side JavaScript files:

```javascript
// From project.srv.js
exports.checkConstraints = function(details) {
    var obj = details.object;
    var errors = [];
    
    // Validate that paths are relative, not absolute
    if (obj.forms_dir && shapi.isPathAbsolute(obj.forms_dir))
        errors.push({
            message: db.MSG('ERROR_PATH_IS_NOT_RELATIVE') + ' : ' + obj.SCHEMA.getProperty('forms_dir'),
            type: 'error',
            path: 'forms_dir'
        });
    
    // More validation logic...
    
    return errors.length ? errors : undefined;
}
```

### - Relation Constraints

Relations define correlations between objects and can be mandatory or optional:

```javascript
// Mandatory relation (from rack.js)
'colocation': {
    template: 'relation.obligatory', // Must have a colocation
    related: 'infra.colocation'
}

// Optional relation (from server.js)
'vendor': {
    template: 'relation', // May have a vendor
    related: 'contacts.vendor'
}
```

### - Event-based Validation

The `applyConstraints` event handler can be used to validate objects during form submission:

```javascript
forms: {
    applyConstraints(details, errors) {	
        return require("sysmgr/project.srv").checkConstraints(details);
    }
}
```

### - Property Constraints

Individual properties can have constraints:

```javascript
'cpu_count': {
    template: 'integer',
    default: 1,
    min: 1,       // Minimum value
    max: 256      // Maximum value
}
```

### - Default Values

Properties can have default values that are applied when a new object is created:

```javascript
'status': {
    template: 'option.obligatory',
    optionSet: {
        code: 'rack_status',
        options: ['operational', 'maintenance', 'offline']
    },
    default: 'operational' // Default value when created
}
```

### - Conditional Visibility and Editability

Properties can be conditionally visible or editable based on other property values:

```javascript
'error': {
    template: 'text',
    readonly: true,
    forms: {
        hidden(details) { 
            return !details.object?.error; // Only visible if there's an error
        }
    }
}
```

### - Transaction-aware Validation

Validation can be transaction-aware, allowing for complex validation scenarios:

```javascript
if (!db.nestedTransaction) {
    // Only perform this validation if not in a nested transaction
    // This prevents recursive validation
}
```

By combining these constraint mechanisms, VisionR enables the creation of robust data models with well-defined relationships and validation rules.

## 6. Advanced UI and ERP Features

VisionR includes several advanced features that make it suitable for building enterprise-grade applications with ERP-like interfaces:

### - Custom highlighting and colors

Objects can be highlighted based on their properties, allowing for visual cues in lists and tables:

```javascript
highlighting: {
    path: 'status.color' /* uses a path template for status-based coloring */
}
```

### - Access control and permissions

Fine-grained access control can be defined at the schema level:

```javascript
access: {
    owner: 'administrators',
    read: 'administrators',
    insert: 'administrators',
    update: 'administrators',
    delete: 'administrators'
}
```

### - Custom actions and buttons

Schemas can define custom buttons and actions for objects:

```javascript
buttons: {
    new: {
        schema: "forms.template",
        ref: "/dialogs/system_manager/project/execution-new",
        executableInTransaction: false
    },
    delete: {
        schema: "forms.template",
        ref: "/dialogs/system_manager/project/execution-delete",
        selection: true,
        executableInTransaction: false,
    },
    execute: false,  // Disable standard execute button
    export: false,   // Disable standard export button
    report: false,   // Disable standard report button
    print: false,    // Disable standard print button
    copy: false,     // Disable standard copy button
}
```

### - Validation and constraints

Custom validation logic can be implemented:

```javascript
applyConstraints(details, errors) {	
    return require("sysmgr/project.srv").checkConstraints(details);
}
```

### - Custom display formatting

Objects can define how they are displayed in lists and references:

```javascript
displayString: function(details) {
    var obj = details.object;
    var p1 = obj.workplace?.code || '?';
    var p2 = obj.relative_path || '<unknown>';
    return p1 + (session.runtime.platform == 'windows' ? '\\' : '/') + p2;
}
```

### - Search configuration

Schemas can specify which fields are used for searching:

```javascript
lookup: "relative_path,code"
```

### - File handling

Schemas can define how to handle file drops:

```javascript
fileDrop(details) { 
    if (details.mobile || !session.loggedIn || (details.relationObject && details.relation)) return;
    return {
        schema: "forms.template",
        ref: "/dialogs/system_manager/project/execution-new",
        executableInTransaction: false
    }
}
```

## 7. Schema Definition "API" Examples

This section demonstrates the "APIs" used in VisionR schema definitions. These are primarily JavaScript constructs within schema files.

**7.1. `module.exports = { ... }` - Objectdef Definition**

Schemas are defined as JavaScript modules exporting a configuration object using `module.exports = { ... }`.  This object encapsulates the schema definition.

**Example (from `helloworld/src/model/schema/greeting.js`):**

```javascript
module.exports = {     
	'greeting' : { 
		properties : {
			'code' : 'code.unique', 
			'description' : false 
		},
		icon : 'favorite'
	}
}
```

This example shows the basic structure, defining the `greeting` objectdef with properties and an icon.

**7.2. `vr.defineI18n(json)` - Internationalization**

The `vr.defineI18n(json)` function integrates i18n translations into the schema. It's called at the beginning of schema files, loading translations from a JSON file.

**Example (from `rack.js`):**

```javascript
vr.defineI18n(require('./rack.i18n.json'));
```

This line loads translations from `rack.i18n.json` for use in the `rack.js` schema.

**7.3. Property Templates within `properties`**

Property templates are defined within the `properties` object of an objectdef. They specify the type and characteristics of each property.

**Example (from `rack.js` - excerpt):**

```javascript
properties: {
    'main.basic': {
        'name': {
            template: 'text.i18n', // text.i18n template
        },
        'model': {
            template: 'text' // text template
        },
        'height': {
            template: 'integer', // integer template
            unit: 'U'
        },
        'status': {
            template: 'option.obligatory', // option.obligatory template
            optionSet: {
                code: 'rack_status',
                options: ['operational', 'maintenance', 'offline']
            },
        },
        'colocation': {
            template: 'relation.obligatory', // relation.obligatory template
            related: 'infra.colocation'
        },
    }
}
```

This example showcases various property templates used within the `properties` definition, including `text.i18n`, `text`, `integer`, `option.obligatory`, and `relation.obligatory`.

These examples demonstrate the primary "APIs" used to construct VisionR schemas, focusing on JavaScript-based configurations and the use of templates for property definitions and i18n integration.

This guide should now provide a more structured and comprehensive overview of the VisionR schema definition approach, using both the Infradash and Helloworld schemas as practical examples.
