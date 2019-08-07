define([] , ()=>{
    return class Gear {
        constructor(draw , r , nodeCount , direction) {
            var circle = draw.circle(r) ;
            circle.fill("green") ;

            var group = draw.group() ;

            var nodes = [] ;
            // var nodeCount = Math.round(r/5.5)  ;
            for(var i = 0 ; i < nodeCount ; i++) {
                var angle = i*Math.PI*2/nodeCount ;

                var rect = draw.rect(10,10).fill("green") ;
                rect.move(r*Math.cos(angle),r*Math.sin(angle)) ;
                nodes.push(rect) ;

                rect.addTo(group) ;
            }

            this.Group = group ;
            this.Circle = circle ;
            this.Nodes = nodes ;
            this.Direction = direction ;
        }
        move(x,y) {
            this.Circle.move(x,y) ;
            var radius = this.Circle.attr("r") ;
            var diagonalLength = Math.sqrt(2*radius**2) ;

            x -= diagonalLength*Math.cos(2.356194490192345) ; // 315 degree
            y += diagonalLength*Math.sin(2.356194490192345) ; // 315 degree

            for(var i = 0 ; i < this.Nodes.length ; i++) {
                var node = this.Nodes[i] ;
                var angle = i*Math.PI*2/this.Nodes.length ;
                var dx = x - node.attr("width")/2 ;
                var dy = y - node.attr("width")/2 ;
                node.move(radius*Math.cos(angle)+dx,radius*Math.sin(angle)+dy) ;

                node.rotate(angle*180/Math.PI) ;
            }
            this.Animate(this) ;
            return this ;
        }
        color(color) {
            this.Circle.fill(color) ;
            for(var i = 0 ; i < this.Nodes.length ; i++) {
                this.Nodes[i].fill(color) ;
            }
            return this ;
        }
        Animate(t) {
            this.Group.animate(this.Circle.attr("r")*300 , "-").during(
                function(pos , morph , eased) {
                    t.Group.rotate(360*pos*t.Direction) ;
                }
            ).loop(true) ;
        }
    }
})