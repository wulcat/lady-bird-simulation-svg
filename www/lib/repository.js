define([] , ()=>{
    return class Repository {
        constructor(draw , name , size , highlightSize , fiddleWidth , animateTime , img) {
            var ratio ;
            var image = draw.image(img).loaded(function(loader){

            }).size(size , size) ; // downloading image with callback

            var outline = draw.circle(size).fill("white") ;
            var mask = draw.mask().add(outline) ;
            image.maskWith(mask) ; // masking image to fit in circle

            var overlap = draw.circle(size).fill("transparent").stroke({color:"white" , width : 2}) ; //for interaction
            // var name = draw.text(name || "").fill("white").size(13) ;//.stroke({color:"red" , width:0.1}) ;
            // name.font('family' , 'Montserrat') ;

            // name.filter(function(add) {
            //     add.gaussianBlur(3) ;
            // })

            overlap.mouseover(function(e) {
                if(this.interactable) {
                    outline.stop() ;
                    image.stop() ;
                    overlap.stop() ;
                    // name.stop() ;

                    ratio = (highlightSize - outline.attr("r")*2)/2 ;
                    outline.animate(animateTime , '>').size(highlightSize).dmove(-ratio,-ratio) ;
                    image.animate(animateTime , '>').size(highlightSize,highlightSize).dmove(-ratio,-ratio) ;
                    overlap.animate(animateTime , '>').size(highlightSize).dmove(-ratio,-ratio) ;
                }            
            }.bind(this)) ;

            overlap.mouseout(function(e) {
                if(this.interactable) {
                    outline.stop() ;
                    image.stop() ;
                    overlap.stop() ;
                    // name.stop() ;

                    ratio = (outline.attr("r")*2 - size)/2 ;
                    outline.animate(animateTime , '>').size(size).dmove(ratio,ratio) ;
                    image.animate(animateTime , '>').size(size, size).dmove(ratio,ratio) ;
                    overlap.animate(animateTime , '>').size(size).dmove(ratio,ratio) ;
                }
            }.bind(this)) ;

            var border = draw.path()
                        .M({x: 221, y: 184.583})
                        .c({x: -41.743, y: 0} , {x: -75.583, y:  -33.839} , {x:-75.583 , y:-75.583} )
                        .S({x:179.257 , y : 33.417} , { x : 221 , y : 33.417 })
                        .S({x:296.583 , y : 67.257} , { x : 296.583 , y : 109 })
                        .S({x:262.743 , y : 184.583} , { x : 221 , y : 184.583 }).Z()
                        .fill("none").stroke({color:"none" , width:2})
                        .size(size+fiddleWidth) ;
            
            overlap.mousedown(function(e) {
                if(this.interactable) {
                    border.stroke({color:"white"});
                    border.drawAnimatedFade({duration:250}).after(function(situation){
                        this.interactable = true ;
                    }.bind(this));
                    this.interactable = false ;
                }
                //pressed highlight
                //start some cool animations on oppiste side of brain
            }.bind(this)) ;
        

            this.Image = image ;
            this.Outline = outline ;
            this.Mask = mask ;
            this.Overlap = overlap ;
            // this.Name = name ;
            this.name = name ;

            this.Border = border ;

            this.fiddleWidth = fiddleWidth ;
            this.Size = size ;
            this.interactable = false ;
            
            this.move(0,0) ;
        }

        move(x,y) {
            x -= this.Size/2 ;
            y -= this.Size/2 ;
            this.Image.move(x,y) ;
            this.Outline.move(x,y) ;
            this.Overlap.move(x,y) ;
            // this.Name.move(x-this.Name.length()/2+this.Size/2 ,y+this.Size+8) ;

            this.Border.move(x-this.fiddleWidth/2,y-this.fiddleWidth/2);
            this.hideInstant() ;
            return this ;
        }
        show(time) {
            time = time || 500 ;
            var overlap = this.Overlap ;
            var image = this.Image ;
            var outline = this.Outline ;
            // var name = this.Name ;

            var ratio = this.Size/2 ;
            
            overlap.stroke({color:"white"}) ;
            overlap.animate(time , '>').size(this.Size).dmove(-ratio , -ratio) ;
            image.animate(time , '>').size(this.Size , this.Size).dmove(-ratio , -ratio).after(function(situation) {
                this.interactable = true ;
            }.bind(this)) ;
            outline.animate(time , '>').size(this.Size).dmove(-ratio , -ratio) ;
        }
        hideInstant() {
            var ratio = this.Size/2 ;
            this.Overlap.size(0.1).dmove(ratio,ratio).stroke({color:"transparent"}) ;
            this.Image.size(0.1,0.1).dmove(ratio,ratio) ;
            this.Outline.size(0.1).dmove(ratio , ratio) ;
        }
    }
})