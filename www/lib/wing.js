define([] , ()=>{
    return class Wing {
        constructor(draw , path) {
            var outline = draw.path(path).fill("yellow") ;

            this.Outline = outline ;
            this.x = 0 ;
            this.y = 0 ;
            // this.Open() ;
        }
        addTo(group) {
            this.Outline.addTo(group) ;
            return this ;
        }
        move(x,y) {
            this.x = x ;
            this.y = y ;
            this.Outline.move(x,y) ;
        }
        dmove(x,y) {
            this.x += x;
            this.y += y ;
            this.Outline.dmove(x,y) ;
        }
        opacity(o) {
            this.Outline.opacity(o) ;
            return this ;
        }
        Open(time , path) {
            var outline = this.Outline ;
            var m = this.Outline.animate(time , "swingTo").plot(path).move(this.x , this.y).opacity(0.4) ;
            // .during(function(pos,morph,eased) {
            //     if(eased > 0.99) outline.before(shell) ;
            // }) ;
            return m ;
        }
    }
})