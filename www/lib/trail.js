var Particle = require('./particle')
define(()=>{
    return class Trail extends Particle {
        constructor(draw , acceleration , pos , direction) {
            super(draw , acceleration , pos , direction)
            console.log("sadf")
        }
    }
})