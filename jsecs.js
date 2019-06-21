/**
 * This first version is not meant to be super fast. Maybe the next version will be.
 */

var jsecs = {}

/** structure of arrays
 * each key is a component name, and the value is an array of the component values
 */
jsecs.componentStore = {}

/**
 * list of all entities. each entry is a map of component name to index into the componentStore
 */
jsecs.entityStore = []

/**
 * Each key is an id.
 * The value is a map of component name to index into the componentStore array for that component
 */
jsecs.entityIndex = {}


// helper function
var debug = function () {
  // this doesn't really work
  var caller = debug.caller
  var args = Array.prototype.slice.call(arguments)
  if (caller && typeof caller.name !== 'undefined') {
    args = [caller.name + '():'].concat(args)
  }

  console.log.apply(console, args)
}

/**
 * Entity constructor
 */
jsecs.Entity = function Entity (optionalName) {
  if (!(this instanceof jsecs.Entity)) {
    return new jsecs.Entity(optionalName)
  }

  if (typeof optionalName !== 'undefined' && typeof jsecs.entityIndex[optionalName] !== 'undefined') {
    var errorString = 'entity id ' + optionalName + ' is already taken'
    console.log(errorString)
    throw new Error(errorString)
  }
  var id = this.id = typeof optionalName === 'undefined' ? Math.random().toString(36).slice(2) : optionalName

  debug('new entitty ' + id)
  jsecs.entityIndex[id] = this
  jsecs.entityStore.push(jsecs.entityIndex[id])
  jsecs.entityIndex[id].entityStoreIndex = jsecs.entityStore.length - 1
  return jsecs.entityIndex[id]
}

/**
 * puts the component in the component store
 * saves off the index in the entity
 */
jsecs.Entity.prototype.add = function add (component) {
  jsecs.componentStore[component.name].push(component.obj)
  jsecs.entityIndex[this.id][component.name] = component.obj
  jsecs.entityStore[jsecs.entityIndex[this.id].entityStoreIndex][component.name] = component.obj // brackets everywhere, what could go wrong?
  debug('add', jsecs.componentStore)
  debug('add', jsecs.entityIndex)
  debug('add', jsecs.entityStore)
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
jsecs.Component = function Component (name, schema) {
  if (!(this instanceof jsecs.Component)) {
    return new jsecs.Component(name, schema)
  }
  debug('new component ' + name)
  jsecs.componentStore[name] = []
  var internalArray = jsecs.componentStore[name]
  debug(jsecs.componentStore)

  // check name
  // check schema

  // helper function which turns keys into a string, like {b: 1, a: 2} => 'a, b'
  // this is for checking that two objects have the exact same keys
  function getkeys (o) {
    return Object.keys(schema).sort((a, b) => a < b).reduce((all, key) => {
      all.push(key)
      return all
    }, []).join(', ')
  }
  const keys = getkeys(schema)

  // hacks so that "x instanceof jsecs.component" returns true
  // while at the same time allowing the return object to be callable
  function instantiateComponent (obj) {
    debug('creating ' + name, obj)

    // make sure the component has ALL the keys it needs
    if (getkeys(obj) !== keys) {
      debug('property mismatch:\n  expected ' + keys + '\n  got ' + getkeys(obj))
      throw new Error('Cannot make component with the incorrect properties')
    }

    // make sure each property is of the correct type.
    Object.keys(obj).map(k => {
      if (obj[k].constructor !== schema[k]) {
        debug('property type mismatch for ' + k + '\n  expected ' + schema[k] + '\n  got ' + obj[k])
        throw new Error('Cannot make component with an incorrect property type')
      }
    })

    internalArray.push(obj)

    return {
      name,
      obj
    }
  }
  // make it be instalceof component or whatever
  instantiateComponent.__proto__ = jsecs.Component.prototype

  // give it all the fun things, too
  instantiateComponent.array = internalArray

  return instantiateComponent
}
jsecs.Component.prototype = Object.create(Function.prototype)

/**
 * THis doesn't really do much
 */
jsecs.System = function System (name, options, fn) {
  if (!(this instanceof jsecs.System)) {
    return new jsecs.System(name, options, fn)
  }
  debug('new system ' + name)

  function runSystem () {
    debug('running ' + name)
    fn()
  }
  runSystem.__proto__ = jsecs.System.prototype
  return runSystem
}
jsecs.System.prototype = Object.create(Function.prototype)

jsecs.entities = {}
jsecs.entities.find = function find (query) {
  return jsecs.entityStore.filter(e => {
    return Object.keys(query).reduce((ok, component) => {
      return ok || ((typeof e[component] !== 'undefined') === query[component])
    }, false)
  })
}

if (typeof window !== 'undefined') {
  window.jsecs = jsecs
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = jsecs
}
