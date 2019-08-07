define(()=>{
    return class Particle {
        constructor(draw , pos , velocity , acceleration , direction , life = 1 , morph) {
            this.group = draw.group()
            this.particle = draw.circle(1).fill("black") ;

            this.scale = 5
            this.velocity = velocity
            this.acceleration = acceleration
            this.position = pos
            this.direction = direction

            this.group.add(this.particle)

            this.particle.move(pos.x , pos.y)

            // Will use gravity simulation for direction
            this.directionScale = 0

            this.life = life
        }
        size(scale=5) {
            this.scale = scale
            this.particle.size(scale)
            return this
        }
        move(x,y) {
            this.particle.move(x,y)
            return this
        }
        color(color) {
            this.particle.fill(color)
            return this
        }
        update() {
            this.position.x += (this.acceleration + this.velocity)*this.direction.x
            this.position.y += (this.acceleration + this.velocity)*this.direction.y

            if(this.acceleration > 0)
                this.acceleration -= 0.005
        }
        rewind() {
            this.position.x -= (this.acceleration + this.velocity)*this.direction.x
            this.position.y -= (this.acceleration + this.velocity)*this.direction.y

            if(this.acceleration > 0)
                this.acceleration += 0.005
        }
        render() {
            var radius
            radius = this.scale/2

            this.particle.move(this.position.x - radius , this.position.y - radius)
        }
    }
})