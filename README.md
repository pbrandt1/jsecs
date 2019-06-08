# jsecs

a javascript entity component system. one of many.

i'm not saying it's the best. it's not the best. it barely works. really it's just me drinking beers and writing code for fun. nothing is checked for type safety, there's really no guarantee anything other than the example works.


```js
var jsecs = require('./jsecs')

// make thee an entity
var me = new jsecs.entity();

// make thine component
var position = new jsecs.component('position', {
    x: Number,
    y: Number,
    z: Number
})

// whomst would not also make a second component?
var velocity = new jsecs.component('velocity', {
    x: Number,
    y: Number,
    z: Number
})

// a system is created for the masses which ruleth the masses
var propagate = new jsecs.system('propagate', {}, function () {
    var dt = 0.1;
    // propagate all the entities with position and velocity
    jsecs.entities.find({
        position: true,
        velocity: true
    }).map(e => {
        e.position.x += e.velocity.x * dt;
        e.position.y += e.velocity.y * dt;
        e.position.z += e.velocity.z * dt;

        e.velocity.z += (-9.81) * dt;

        // ground impact
        if (e.position.z <= 0) {
            e.position.z = 0;
            e.velocity.z = 0;
        }
    })
})

// what good system would not bare itself before Divinity?
var render = new jsecs.system('render', {}, function () {
    jsecs.entities.find({
        position: true
    }).map(e => {
        console.log(e.id, 'x:', e.position.x, 'y:', e.position.y, 'z:', e.position.z, 'vx:', e.velocity.x, 'vy:', e.velocity.y, 'vz:', e.velocity.z)
    })
})

// the ECS has beeen configured



// Now add data
me.add(position({
    x: 29,
    y: -77,
    z: 0
}))

me.add(velocity({
    x: 0,
    y: 0,
    z: 100 // to the moon!
}))

// the system functions shall be called upon when necessary
var t = 0; // ms
function step() {
    t += 100;
    propagate() // propagate every cycle (~0.1 seconds)

    // render once per second
    if (t % 1000 === 0) {
        render()
    }
    setTimeout(step, 100)
}
step()
```

to run the test

```
node test.js
```

or for more fancy debug info that doesn't really work the way i want it to yet (kinda forget how to make nice debug logs without libraries)

```
DEBUG=1 node test.js
```

