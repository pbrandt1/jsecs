const component_store = {};
const entity_store = [];
const entity_index = {}
const system_store = {};

// helper function
const debug = function() {
    if (process && typeof process.env.DEBUG === 'undefined') {
        // return in node if DEBUG env var not set
        return;
    }

    // this doesn't really work
    var caller = debug.caller;
    var args = Array.prototype.slice.call(arguments)
    if (caller && typeof caller.name !== 'undefined') {
        args = [caller.name + '():'].concat(args);
    }

    console.log.apply(console, args);
}

function entity() {
    if (!(this instanceof entity)) {
        return new entity();
    }
    var id = this.id = Math.random().toString(36).slice(2)
    debug('new entitty ' + id)
    entity_index[id] = {id: id};
    entity_store.push(entity_index[id]);
    entity_index[id].entity_store_index = entity_store.length - 1;
    debug(entity_index)
    debug(entity_store)
}

// puts the component in the component store
// saves off the index in the entity
entity.prototype.add = function(component) {
    component_store[component.name].push(component.obj);
    entity_index[this.id][component.name] = component.obj;
    entity_store[entity_index[this.id].entity_store_index][component.name] = component.obj // brackets everywhere, what could go wrong?
    debug('add', component_store)
    debug('add', entity_index)
    debug('add', entity_store)
}

// name can be any string
// schema is like a mongodb schema, except flat
/**
 * example schema:
 * var schema = {
 *   x: Number,
 *   y: Number,
 *   z: Number
 * }
 * 
 * @param {string} name the name of your component type
 * @param {flat object} schema the type definitions for your component
 */
function component(name, schema) {
    if (!(this instanceof component)) {
        return new component(name, schema)
    }
    debug('new component ' + name)
    component_store[name] = []
    debug(component_store)

    // check name
    // check schema

    // hacks so that "x instanceof jsecs.component" returns true
    // while at the same time allowing the return object to be callable
    function instantiate_component(obj) {
        debug('creating ' + name, obj)
        return {
            name,
            obj
        }
    }
    instantiate_component.__proto__ = component.prototype
    return instantiate_component
}
component.prototype = Object.create(Function.prototype)

function system(name, options, fn) {
    if (!(this instanceof system)) {
        return new system(name, options, fn);
    }
    debug('new system ' + name)

    function run_system() {
        debug('running ' + name)
        fn()
    }
    run_system.__proto__ = system.prototype
    return run_system;
}
system.prototype = Object.create(Function.prototype)

var entities = {}
entities.find = function(query) {
    return entity_store.filter(e => {
        return Object.keys(query).reduce((ok, component) => {
            return ok || ( (typeof e[component] !== undefined ) === query[component]);
        }, false)
    })

}

module.exports = {
    entity,
    component,
    system,
    entities
}