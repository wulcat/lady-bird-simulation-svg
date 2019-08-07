define(['vector2' , 'line2'], (Vector2,Line2)=>{
    return class WormHole {
        constructor(draw , position = new Vector2() , radius = 200 , angle = 360) {
            let group = draw.group()
            let body = draw.path("M512.54,544.264v-87.735c0-20.222,8.732-20.837,8.732-20.837c-4.729-5-8.668-5.941-8.668-16.347 c0-12.253,8.668-14.844,8.668-14.844C510.434,404.358,512,392,512,392l-9.5-7.84c0.25,4.66-7.016,10.153-10.158,12.748 c-0.028,0.023-0.084,0.074-0.117,0.09c-6.45,3.168-13.002,7.39-15.057,13.831c-0.448,1.404-2.569,5.212-7.168,2.046 c5.292,6.51,1.764,16.596,1.764,16.596c3.234-4.855,5.289-1.462,6.242-0.115c3.308,4.673,7.159,8.94,12.877,10.739 c0.21,0.066,0.626,0.21,0.835,0.276c12.615,3.963,12.14,11.061,12.531,16.158l2.026,24.222 c-0.053,6.305,0.087,39.907,0.058,56.935l-0.363,20.848h6.632v-13.907 M494.845,430.775c-6.313,0-11.431-5.118-11.431-11.432 c0-6.313,5.118-11.431,11.431-11.431c6.313,0,11.432,5.118,11.432,11.431C506.276,425.657,501.158,430.775,494.845,430.775z").fill('#009999')
            let glassRadius = 23/2
            let glass = draw.circle(glassRadius*2).fill('#009999').opacity(0.4).move(494.845 - glassRadius, 419.344 - glassRadius)
            // let wireFrameConnecter = draw.path("M511.999,408.75c-0.268,0-0.538-0.071-0.783-0.221 l-9.375-5.75c-0.706-0.433-0.928-1.357-0.495-2.063c0.433-0.707,1.357-0.927,2.063-0.495l9.375,5.75 c0.706,0.433,0.928,1.357,0.494,2.063C512.996,408.496,512.503,408.75,511.999,408.75z")
            // wireFrameConnecter.dmove(0,-15).fill("white")

            group.add(body)
            group.add(glass)
            // group.add(wireFrameConnecter)

            this.wormhole = group

            this.position = position
            this.radius = radius
            this.angle = angle

            this.move(position.x , position.y)
        }
        move(x,y) {
            this.wormhole.move(x-348,y-600)
        }
        inRange(particle) {
            let distance
            distance = Vector2.Distance(particle.position , this.position)

            return distance <= this.radius ? true : false
        }
        insideCone(particle) {
            let slope , angle , wormholeAngle

            slope = new Line2(this.position , particle.position).Equation.m
            angle = Math.atan(slope) * 180 / Math.PI
            wormholeAngle = this.angle/2
            if(angle < wormholeAngle && angle > -wormholeAngle) 
                return true
            else 
                return false
        }
    }
});