define(['math'] , (Math)=>{
    return class Vector2 {
        constructor(x=0,y=0) {
            this.x = x
            this.y = y
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
        static Interpolate(a,b,t) {
            return new Vector2(Math.Interpolate(a.x,b.x,t) , Math.Interpolate(a.y,b.y,t))
        }
        static Distance(vec1 , vec2) {
            return Math.sqrt((vec1.x - vec2.x)**2 + (vec1.y - vec2.y)**2) ;
        }
        static AngleBetween(vec1 , vec2) {
            return Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x)  ;
        }
        // TODO: Create a cross product
        static Cross(a,b) {
            return new Vector2(a.y - b.y , b.x - a.x)
        }
        static Dot(a,b) {
            return a.x*b.x + a.y*b.y
        }
        static Direction(a,b) {
            return new Vector2(a.x-b.x , a.y-b.y).Normalized()
        }
        static AngleBetween(a,b) {
            return Math.atan2(b.y - a.y, b.x - a.x)
        }
    }
})