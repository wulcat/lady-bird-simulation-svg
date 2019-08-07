define(['vector2' ] , 
    (Vector2) => {
        return class {
            constructor(a=new Vector2(),b=new Vector2()) {
                this.a = a
                this.b = b
            }
            // Slope and I-Intercept
            get Equation() {
                var m , c , a , b
                a = this.a , b = this.b

                m = (a.y - b.y) / (a.x - b.x)
                c = a.y - m*a.x

                return {
                    m : m ,
                    c : c ,
                }
            }
            // TODO: Rewrite for personal usage
            // Credits to https://bl.ocks.org/milkbread/11000965 since doing little math would give on infinite line and was in hurry
            isIntersectingCircle(circle) {
                var a , b , c , radius , eDistAtoB , d , t , eDistCtoE , dt

                a = this.a , b = this.b , c = circle.position ,radius = circle.scale

                // Calculate the euclidean Vector2.Distance between a & b
                eDistAtoB = Math.sqrt( Math.pow(b.x-a.x, 2) + Math.pow(b.y-a.y, 2) );
            
                // compute the direction vector d from a to b
                d = new Vector2((b.x-a.x)/eDistAtoB , (b.y-a.y)/eDistAtoB)
                // Now the line equation is x = dx*t + ax, y = dy*t + ay with 0 <= t <= 1.
            
                // compute the value t of the closest point to the circle center (cx, cy)
                t = (d.x * (c.x-a.x)) + (d.y * (c.y-a.y));
            
                // compute the coordinates of the point e on line and closest to c
                var e = {coords:new Vector2(), onLine:false};
                e.coords.x = (t * d.x) + a.x;
                e.coords.y = (t * d.y) + a.y;
            
                // Calculate the euclidean Vector2.Distance between c & e
                eDistCtoE = Math.sqrt( Math.pow(e.coords.x-c.x, 2) + Math.pow(e.coords.y-c.y, 2) );
            
                // test if the line intersects the circle
                if( eDistCtoE < radius ) {
                    // compute Vector2.Distance from t to circle intersection point
                    dt = Math.sqrt( Math.pow(radius, 2) - Math.pow(eDistCtoE, 2));
            
                    // compute first intersection point
                    var f = {coords:new Vector2(), onLine:false};
                    f.coords.x = ((t-dt) * d.x) + a.x;
                    f.coords.y = ((t-dt) * d.y) + a.y;
                    // check if f lies on the line
                    f.onLine = this.is_on(a,b,f.coords);
            
                    // compute second intersection point
                    var g = {coords:new Vector2(), onLine:false};
                    g.coords.x = ((t+dt) * d.x) + a.x;
                    g.coords.y = ((t+dt) * d.y) + a.y;
                    // check if g lies on the line
                    g.onLine = this.is_on(a,b,g.coords);
            
                    return {points: {intersection1:f, intersection2:g}, pointOnLine: e};
            
                } else if (parseInt(eDistCtoE) === parseInt(radius)) {
                    // console.log("Only one intersection");
                    return {points: false, pointOnLine: e};
                } else {
                    // console.log("No intersection");
                    return {points: false, pointOnLine: e};
                }
            }
            is_on(a,b,c) {
                return Vector2.Distance(a,c) + Vector2.Distance(c,b) == Vector2.Distance(a,b)
            }

            // on infinte line intersection with circle
            intersectInfiniteLineToCircle(circle) {
                var p1 , p2 , c , r , p12 , n , p1c , v , intersect
            
                p1 = this.a , p2 = this.b , c = circle.position , r = circle.radius

                p12 = new Vector2(p2.x - p1.x , p2.y - p1.y)
                n = p12.Normalized()

                p1c = new Vector2(c.x-p1.x , c.y-p1.y)
                v = Math.abs(n.x*p1c.y - n.y*p1c.x)

                intersect = (v <= r)

                return intersect

                // other way around
                var a , b , c , lineEquation , delta , position
                lineEquation = this.Equation
                position = circle.position

                a = lineEquation.m**2 + 1
                b = 2*(lineEquation.m*lineEquation.c - lineEquation.m*position.y - position.x)
                c = position.y**2 - circle.radius**2 + position.x**2 - 2*lineEquation.c*position.y + lineEquation.c**2

                delta = Math.quadratic.discriminant(b,a,c)
                if(delta >= 0)
                    return true
                else return false

            }
        }
    }
)