const fs = require('fs');

const dir = 'schema.input/';

const all_schema = {};

files = fs.readdirSync(dir);

for (let fn of files) {
    let data = fs.readFileSync(dir + fn, 'utf-8');
    all_schema[fn] = JSON.parse(data);
}


const schema = all_schema['base_schema.json'];

function camelToUnderscore(key) {
   const result = key.replace( /([A-Z])/g, " $1" );
   return result.split(' ').join('_').toLowerCase();
}

function createDefinition(className, properties = [], abstract = false, parent = false, type='class'){

    let p = [];
    for (let property in properties ){
        p.push( `readonly ${property}: ${properties[property]}`);
    }

    const tpl = `export ${abstract? 'abstract': ''} ${type} ${className} ${parent? 'extends ' + parent: ''} {
        ${p.join('\n\t')}
}`;
    return tpl;
}

const definitions = {
    'abstracts': [],
    'events': [],
    'global_contexts': [],
    'location_contexts': []
};

// first do events
events = schema['events'];
for ( let eventType in events) {

    let abstract = false;
    let parent = undefined;
    let rc = false;

    let properties = [];

    let discriminator = camelToUnderscore(eventType);

    let event = events[eventType];

    // check if this is an abstract class
    if( eventType.match(/Abstract.*?/) ){
        abstract = true;
        properties['_' + discriminator] = true;
    } else {
        properties['event'] = `'${eventType}'`;
    }

    // check if we extend any parents
    if ( event['parents'].length > 0 ){
        parent = event['parents'].shift();
    }

    // check for required contexts
    if ( event['requiresContext'].length > 0 ) {
        rc = event['requiresContext'];
    }

    let tpl = createDefinition(className=eventType, properties=properties, abstract=abstract, parent=parent);

    if ( abstract ) {
        definitions['abstracts'].push(tpl);
    } else {
        definitions['events'].push(tpl);
    }
}

contexts = schema['contexts'];
// first determine parents for non abstract contexts
// so we know which are location contexts

const contextToAbstractParent = {}

for ( let contextType in contexts ){
    if( !contextType.match(/Abstract.*?/) ){
        if ( contexts[contextType]['parents'].length > 0 ) {
            contextToAbstractParent[contextType] = contexts[contextType]['parents'][0];
        } else{
            contextToAbstractParent[contextType]  = '';
        }
    }
}

function getParents (context){
    if ( !context.match(/Abstract.*?/) ){
        return [...getParents(contextToAbstractParent[context]), ...[context]];
    } else {
        return [context];
    }
}


for ( let contextType in contexts ){

    const context = contexts[contextType];
    let properties = [];
    let abstract = false;
    let parent = false;
    let stackType = '';
    const discriminator = camelToUnderscore(contextType);

    // check if this is an abstract class
    if( contextType.match(/Abstract.*?/) ){
        abstract = true;
        properties['_' + discriminator] = true;
    } else {

        // check ancestry of context, if this is a location or global context
        const parents = getParents(contextType);
        if ( parents[0].match(/AbstractLocation/) ){
            stackType = 'location_contexts';
        } else {
            stackType = 'global_contexts';
        }

        // literal discriminator for non-abstract class
        properties['_context_type'] = `'${contextType}'`;
    }

    if ( context['properties'] ){
        for ( let propertyName in context['properties'] ) {
            let propertyType;
            switch (context['properties'][propertyName]['type']) {
                case 'integer':
                    propertyType = 'int';
                case 'string':
                    propertyType = 'str';
            }
            properties[propertyName] = propertyType;
        }
    }
    console.log(context['properties']);

    // check if we extend any parents
    if ( context['parents'] && context['parents'].length > 0 ){
        parent = context['parents'].shift();
    }

    let tpl = createDefinition(
        className=contextType, properties=properties, abstract=abstract, parent=parent, type='interface');

    if ( abstract ) {
        definitions['abstracts'].push(tpl);
    } else {
        definitions[stackType].push(tpl);
    }
}

// now write some files
for ( let definition_type in definitions ){
    const filename = `${definition_type}.d.ts`;
    fs.writeFileSync(filename, definitions[definition_type].join("\n"));
}
