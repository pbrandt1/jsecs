var jsecs = require('./jsecs')

var me = new jsecs.entity();

var position = new jsecs.component('position', {
    x: Number,
    y: Number,
    z: Number
})

var velocity = new jsecs.component('velocity', {
    x: Number,
    y: Number,
    z: Number
})

console.log(typeof position)
console.log(position instanceof jsecs.component)

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

var render = new jsecs.system('render', {}, function () {
    jsecs.entities.find({
        position: true
    }).map(e => {
        console.log(e.id, 'x:', e.position.x, 'y:', e.position.y, 'z:', e.position.z, 'vx:', e.velocity.x, 'vy:', e.velocity.y, 'vz:', e.velocity.z)
    })
})

var t = 0; // ms
function step() {
    t += 100;
    propagate()

    if (t % 1000 === 0) {
        render()
    }
    setTimeout(step, 100)
}
step()