define(['vector2'] , (Vector2)=>{
    return class Blower {
        constructor(position = new Vector2() , radius = 200) {
            this.position = position
            this.radius = radius
        }
        inRange(particle) {
            let distance
            distance = Vector2.Distance(particle.position , this.position)

            return distance <= this.radius ? true : false
        }
    }
})