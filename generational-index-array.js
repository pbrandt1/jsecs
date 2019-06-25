// testing out various methods of storing data for the components

// if they're just in an array, when objects get deleted then you have either a big problem with holes in the array or you get the ABA problem
// the ABA problem is a weird name. basically one peice of code holds an index into the array, while a different piece of code deletes and replaces the thing at that index
// so the first thing now holds an index to what should be a deleted item, but something else is there now. 

// a generational index is a composite key, composed of the actual index in the array, and a monotonically increasing generational number

// i don't really think this has much in the way of performance gains because javascript arrys are supposed to be maps under the hood, instead of contiguous blocks of memory like in c/fortran

function GenerationalIndexArray() {
    if (!(this instanceof GenerationalIndexArray)) {
        return new GenerationalIndexArray()
    }

    this.data = [];
    this._generations = [];
    this._open_indices = [];
}

GenerationalIndexArray.prototype.push = function push(item) {
    var index;
    var generation;

    // take the lowest open index. if there are no open indices, push back
    if (this._open_indices.length === 0) {
        this.data.push(item)
        this._generations.push(0) // assuming this happens in lockstep
        generation = 0;
        index = this.data.length - 1;
    } else {
        index = this._open_indices.pop();
        generation = this._generations[index]; // this is incremented during the "remove" function
        this.data[index] = item
    }

    return [index, generation]
}

GenerationalIndexArray.prototype.remove = function remove(key) {
    key = key || [];
    const index = key[0];
    const generation = key[1];
    if (generation === this._generations[index]) {
        this.data[index] = null;// i don't think this really does anything
        this._generations[index]++;
        this._open_indices.push(index);
        return true
    } else {
        return false
    }
    
}

GenerationalIndexArray.prototype.get = function get(key) {
    key = key || []
    const index = key[0];
    const generation = key[1];
    if (generation === this._generations[index]) {
        return this.data[index]
    } else {
        return null
    }
}

// tests
if (typeof window === 'undefined' && !module.parent) {
    var assert = require('assert')
    var i = new GenerationalIndexArray();
    var position = {
        x: 10,
        y: 11
    }
    
    var a = i.push(position)
    var b = i.push({x: 1, y:0})
    var c = i.push({x: 111, y:-100})
    console.log(i.data)
    var ok = i.remove(b)

    console.log(i.data)
    console.log(ok)
    var getb = i.get(b)
    assert.equal(getb, null)
    var newb = i.push({x:1111111, y: 1234})
    console.log(i.data);
    assert.equal(i.get(newb).x, 1111111)
    assert.equal(i.get(newb).y, 1234)

    assert.equal(i.get(a).x, position.x)
    assert.equal(i.get(a).y, position.y)
    assert.equal(i.get(), null)
    assert.equal(i.get(c).x, 111)
    console.log('all tests passed')
}