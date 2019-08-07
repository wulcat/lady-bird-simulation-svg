define(['math'] , (Math)=>{
    return class Vector3 {
        constructor(x=0,y=0,z=0) {
            this.x = x
            this.y = y
            this.z = z
        }
        RotateAround(origin , angleInRad) {
            var dx,dy,cos,sin

            cos = Math.cos(angleInRad)
            sin = Math.sin(angleInRad)

            dx = this.x - origin.x
            dy = this.y - origin.y

            this.x = cos*dx - sin*dy + origin.x
            this.y = sin*dx + cos*dy + origin.y
        }
        get Magnitude() {
            return Math.sqrt(this.x*this.x + this.y*this.y)
        }
        Normalized() {
            var m = this.Magnitude
            return new Vector2(this.x/m , this.y/m)   
        }
        Negate() {
            this.x = -this.x
            this.y = -this.y
            return this
        }
        static Distance(vec1 , vec2) {
            return Math.sqrt((vec1.x - vec2.x)**2 + (vec1.y - vec2.y)**2) ;
        }
        static AngleBetween(vec1 , vec2) {
            return Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x)  ;
        }
    }
})