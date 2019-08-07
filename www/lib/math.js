define(['vector2','vector3'] , (Vector2,Vector3)=>{
    // (function(){
        Math.clamp=function(b,c,a) {
            return Math.max(b , Math.min(c , a));
        }
    // })();

    Math.randomFloat = (min, max)=>{
        return Math.random() * (max - min) + min;
    }

    Math.randomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    
    Math.CrossProduct = (a,b)=> {
        return new Vector3( a.y*b.z - a.z*b.y ,
                            a.z*b.x-a.x*b.z ,
                            a.x*b.y - a.y*b.x )
    }

    Math.Interpolate = (a,b,t)=> {
        return a*(1-t) + b*t
    }

    Math.factorial = (num=0)=> {
        var j = 1
        while(num != 0) {
            j *= num
            num--
        }
        return j
    }

    Math.quadratic = class {
        static discriminant(b,a,c) {
            return (b**2) - (4*a*c)
        }
    }

    // Permuatation
    Math.permuatation = (n=0,k=0)=> {
        return Math.factorial(n)/(Math.factorial(n-k))
    }
    // Binomial Coefficient nCk (combination) (n choose k)
    Math.combination = (n,k)=>{
        var d = 0 ; 
        d = Math.factorial(n)/(Math.factorial(k)*Math.factorial(n-k)) ;
        return d ;
    }

    // TODO: Implement a better root finding algorithm
    // Root Approximation Algorithm
    Math.bisection = (f , a , b , epsilon)=>{
        var mid = (a+b/2)

        var counter = 0
        while(Math.abs(f(mid)) > epsilon) {
            if(f(mid) < 0)
                a = mid
            else
                b = mid
            mid = (a+b)/2

            // if the test is not findng a value we break the loop
            if(counter > 100) break 
            else counter++
        }
        return mid
    }

    Math.stretchLine = (start , end , current)=>{
        end = end - start
        current = current - start
        var m = 1 / end
        current = current * m
        return current
    }

    Math.interpolate = {
        Value : function(start , end , current) {
                end -= start
                current -= start
                current = current/end
                return current
        }
    }


    Math.bezier = {
        TimeOnNthBezierCurve : (currentPoint ,  ...params)=>{
            var n = params.length-1
            var dynamicAnonX = "-"+currentPoint[0]
            var dynamicAnonY = "-"+currentPoint[1]
            var j = 0
    
            while(params.length > 0) {
                var mj = params.length-1
                var mcoeff = [0,0]
                for(var mi = 0 ; mi <= mj; mi++) {
                    var msubCoeff = (-1)**(mi+mj)/(Math.factorial(mi)*Math.factorial(mj-mi)) // circular brackets were imp in denomitor
                    var permu = Math.permuatation(n,mj)
                    mcoeff[0] += msubCoeff*params[mi][0]*permu
                    mcoeff[1] += msubCoeff*params[mi][1]*permu
                }
                dynamicAnonX += "+(t**"+(n-j)+")*("+mcoeff[0]+")"
                dynamicAnonY += "+(t**"+(n-j)+")*("+mcoeff[1]+")"
    
                params.pop()
                j++
            }
            var anonymous = (t) => {
                //somethings buggy considering the average as well as just y
                return (eval(dynamicAnonX))// + eval(dynamicAnonY))/2
                // return (eval(dynamicAnonY))
                // return (eval(dynamicAnonX) + eval(dynamicAnonY))/2 // find average for more accuracy
            }
            return Math.bisection(anonymous , 0 , 1 , 0.001)
        } ,

        // Length of paramets defines the type of beizer curve
        // Time t and parameters [[x0,y0],....[xn,yn]] returns point on curve . Using linear interpolation from 0 to 1 as time t one can draw curve by consuming points
        NthBezierCurve : (t , ...params)=>{
            var n = params.length-1
            var pointOnCurve = [0,0]

            for(var i = 0 ; i <= n ; i++) {
                var poly = (t**i)*((1-t)** (n-i) )*Math.combination(n , i)

                pointOnCurve[0] += poly * params[i][0]
                pointOnCurve[1] += poly * params[i][1]

            }
            return pointOnCurve
        } ,

        InsertPointOnBezierCurve : (point , time , ...params)=>{
            // console.log(params.length)
            if(params.length > 4)
                throw "Error: Number of points exceeded. Current version supports only Linear , Qudratic & Cubic Bezier Curves."
            else if(params.length < 2)
                throw "Error: Minimum 2 points required."
            
            // Degree elevation to cubic bezier curve
            while(params.length < 4)
                params = ElevateDegreeBezierCurve(Object.assign([] , params))
    
            // cubically the point at time from right control point of first point and left control point of last node
            var timeOnControlPoint = Math.bezier.NthBezierCurve(time , params[1] , params[2])
            // recalculations of control points and inserting them in our curve params array
            // console.log(time)
            params[1] = Math.bezier.NthBezierCurve(time , params[0] , params[1])
            params[2] = Math.bezier.NthBezierCurve(time , params[2] , params[3])
            var leftControlPoint = Math.bezier.NthBezierCurve(time , params[1] , timeOnControlPoint)
            // var leftControlPoint = Math.bezier.NthBezierCurve(time  , timeOnControlPoint , params[1])
            var rightControlPoint = Math.bezier.NthBezierCurve(time , timeOnControlPoint , params[2])
    
            // var rightControlPoint = [2*point[0]-leftControlPoint[0] , 2*point[1]-leftControlPoint[1]] // changes curve becoz of approximation root bisection
            params.splice(2,0, leftControlPoint , point , rightControlPoint)
    
            return params
        }
    }

    return Math
})
// declare global {
//     interface Interpolate {
//         LinearInt(start : number , end : number , time : number) : number
//         LinearFloat(start : number , end : number , time : number) : number
//     }
//     interface Random {
//         RandomInt(min : number , max : number) : number
//         RandomFloat(min : number , max : number) : number
//     }
//     interface Algebra {
//         Factorial(a : number) : number
//         Permutation(n : number , k : number) : number
//         Combination(n : number , k : number) : number
//     }
//     interface Quadratic {
//         Discriminant(b : number , a : number , c : number) : number
//         Bisection(fn : (value:number) => number , minExpectedValue : number , maxExpectedValue : number , accuracy : number) : number
//     }
//     interface BezierCurve {
//         /**
//         * This is the foo function
//         * @param time Using linear interpolation from 0 to 1 as parameter time one can a draw curve by consuming points
//         * @param [[[[x0,y0],....,[xn,yn]]
//         * @returns returns a [x0,y0] Point on a Curve
//         */
//         NthBezierCurve(time : number , ...params : number[][]) : number[]

//         InsertPointOnBezierCurve(point : number[] , time : number, ...params : number[][]) : number[][]
//         ElevateDegreeBezierCurve(params : number[][]) : number[][]
//         TimeOnNthBezierCurve(point : number[] , ...params : number[][]) : number
//     }
//     interface Math {
//         Clamp(min : number , max : number , value : number) : number
//         Interpolate : Interpolate
//         Random : Random
//         Algebra : Algebra
//         Quadratic : Quadratic
//         BezierCurve : BezierCurve
//     }
// }