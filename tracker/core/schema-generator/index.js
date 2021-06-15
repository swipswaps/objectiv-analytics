const fs = require('fs');

// contains object, describing the object, eg, stuff like:
// class_name, properties, parent, abstract, type, interfaces
const object_definitions = {
    'events': {},
    'contexts': {}
};

// contains actual typescript declarations of object
const object_declarations = {
    'abstracts': {},
    'events': {},
    'global_contexts': {},
    'location_contexts': {}
}

// list to cache list of abstract parents of interfaces
const toAbstractParent = {}
function getParents (class_name) {
    if ( !class_name.match(/Abstract.*?/) ){
        return [...getParents(toAbstractParent[class_name]), ...[class_name]];
    } else {
        return [class_name];
    }
}

function camelToUnderscore(key) {
   const result = key.replace( /([A-Z])/g, " $1" );
   return result.split(' ').join('_').toLowerCase();
}


function createDefinition(params = {
    class_name: '',
    properties: [],
    abstract: false,
    parent: false,
    definition_type: 'class',
    interfaces: false
}){
    let p_list = [];
    for (let property in params.properties ){
        p_list.push( `readonly ${property}: ${params.properties[property]};`);
    }

    const tpl = `export ${params.abstract? 'abstract ': ''}${params.definition_type} ${params.class_name}` +
        `${params.parent? ' extends ' + params.parent: ''}` +
        `${params.interfacess? ' implements ' + params.interfaces.join(',') : ''} {
        ${p_list.join('\n\t')}
}`;
    return tpl;
}

function createMissingAbstracts(params = {
    class_name: '',
    properties: [],
    abstract: false,
    parent: false,
    definition_type: 'class',
    interfaces: false
}){
    // if our parent is not abstract, we cannot extend it
    // so create a new one
    if ( params.parent && !params.parent.match(/Abstract/) ) {
        const class_name = `Abstract${params.parent}`;

        // if the abstract hasn't been created yet, let's do it now
        if (!object_definitions[class_name]) {
            // let's find the parent
            let discriminator = camelToUnderscore(class_name);
            let properties = [];
            properties['_' + discriminator] = true;

            const parents = getParents(params.class_name);
            const parent = parents.shift();

            const intermediate_params = {
                class_name: class_name,
                properties: properties,
                abstract: true,
                parent: parent,
                definition_type: 'class'
            };
            createMissingAbstracts(intermediate_params);

            // add params to map
            object_definitions[class_name] = intermediate_params;
        }
        params.parent = class_name;
    }
}

const dir = 'schema.input/';
files = fs.readdirSync(dir);

// read all schema files
const all_schema = {};
for (let fn of files) {
    let data = fs.readFileSync(dir + fn, 'utf-8');
    all_schema[fn] = JSON.parse(data);
}


// TODO: properly combine all schema files into one
const schema = all_schema['base_schema.json'];

// first do events
events = schema['events'];
for ( let event_type in events ){
    if( !event_type.match(/Abstract.*?/) ){
        if ( events[event_type]['parents'].length > 0 ) {
            toAbstractParent[event_type] = events[event_type]['parents'][0];
        } else{
            toAbstractParent[event_type]  = '';
        }
    }
}
for ( let event_type in events) {

    let properties = [];
    let abstract = false;
    let parent = undefined;
    let definition_type = undefined;
    let interfaces = false;

    let event = events[event_type];

    // check if this is an abstract class
    if( event_type.match(/Abstract.*?/) ) {
        const discriminator = camelToUnderscore(event_type);
        properties['_' + discriminator] = true;
        abstract = true;
        definition_type = 'class';
    } else {
        properties['event'] = `'${event_type}'`;
        definition_type = 'interface';
    }

    // check if we extend any parents
    // we take the first one, if it exists
    if ( event['parents'].length > 0 ){
        parent = event['parents'].shift();
    }

    // check for required contexts
    if ( event['requiresContext'].length > 0 ) {
        interfaces = event['requiresContext'];
    }

    object_definitions[event_type] = {
        type: 'event',
        class_name: event_type,
        properties: properties,
        abstract: abstract,
        parent: parent,
        definition_type: definition_type,
        interfaces: interfaces
    };
}


contexts = schema['contexts'];
// first determine parents for non abstract contexts
// so we know which are location contexts

for ( let context_type in contexts ){
    if( !context_type.match(/Abstract.*?/) ){
        if ( contexts[context_type]['parents'].length > 0 ) {
            toAbstractParent[context_type] = contexts[context_type]['parents'][0];
        } else{
            toAbstractParent[context_type]  = '';
        }
    }
}


for ( let context_type in contexts ){

    const context = contexts[context_type];
    let properties = [];
    let abstract = false;
    let parent = false;
    let definition_type = undefined;
    let interfaces = false;
    let stack_type = '';


    // check if this is an abstract class
    if( context_type.match(/Abstract.*?/) ){
        const discriminator = camelToUnderscore(context_type);
        properties['_' + discriminator] = true;
        abstract = true;
        definition_type = 'class';
        stack_type = 'abstracts';
    } else {

        // check ancestry of context, if this is a location or global context
        const parents = getParents(context_type);
        if ( parents[0].match(/AbstractLocation/) ){
            stack_type = 'location_contexts';
        } else {
            stack_type = 'global_contexts';
        }

        // literal discriminator for non-abstract class
        properties['_context_type'] = `'${context_type}'`;
        definition_type = 'interface';
    }

    if ( context['properties'] ){
        for ( let property_name in context['properties'] ) {
            properties[property_name] = context['properties'][property_name]['type'];
        }
    }

    // check if we extend any parents
    if ( context['parents'] && context['parents'].length > 0 ){
        parent = context['parents'].shift();
    }

    object_definitions[context_type] = {
        object_type : 'context',
        class_name: context_type,
        properties: properties,
        abstract: abstract,
        parent: parent,
        definition_type: definition_type,
        interfaces: interfaces,
        stack_type: stack_type
    };
}

// let's fix inheritance properly, objects (interfaces) extending non abstracts are not allowed
// so we add an abstract class on top, that extends the parents' parent (until we find an abstract)
for ( let object_type in object_definitions ) {
    let object_definition = object_definitions[object_type];
    createMissingAbstracts(object_definition);
}

// a little bit of cleaning / housekeeping. If:
// - an object is not abstract
// - but there is an abstract version of it
// - and it's not its parent
// we fix that here.
for ( let object_type in object_definitions ) {
    let object_definition = object_definitions[object_type];
    let abstract_class_name = 'Abstract' + object_definition['class_name'];
    if ( !object_definition.abstract
        && object_definitions[abstract_class_name]
        && object_definition['parent'] != abstract_class_name){

        // we move it
        object_definitions[object_type]['parent'] = abstract_class_name;
    }
}


// now let's generate the object declarations
// and put them in the correct location
for ( let object_type in object_definitions ){
    let object_definition = object_definitions[object_type];

    let definition_type = 'events';
    if ( object_definition.abstract ) {
        definition_type = 'abstracts';
    } else if ( object_definition.object_type === 'context' ){
        definition_type = object_definition.stack_type;
    }
    object_declarations[definition_type][object_type] = createDefinition(object_definitions[object_type]);
}


// now write some files
for ( let definition_type in object_declarations ){
    const filename = `${definition_type}.d.ts`;

    // list of classes to import
    let imports = [];

    // we only import abstract classes, so no need to do this when writing the abstract classes
    if ( definition_type != 'abstracts' ){

        // add import statement of abstracts in non- abstract files
        // import { AbstractGlobalContext } from './abstracts';
        // NOTE: there may be duplicates in this array, so make sure to fix that later
        for ( let object_type in object_declarations[definition_type] ){
            if ( object_definitions[object_type].parent && object_definitions[object_type].parent.match(/Abstract/) ){
                imports.push(object_definitions[object_type].parent);
            }
        }
    }
    // if we have more than 0 imports, make them unique (cast to set) and generate import statement
    const import_statement = imports.length > 0 ? `import {${[... new Set(imports)].join(',')}} from './abstracts'`: null;

    // write imports and declarations to file
    fs.writeFileSync(filename, [...[import_statement], ...Object.values(object_declarations[definition_type])].join("\n"));
}

// generate index for all declarations
fs.writeFileSync('index.d.ts', Object.keys(object_declarations)
    .map( (element) => {
        return `export * from './${element}';`;
    }).join('\n')
);
