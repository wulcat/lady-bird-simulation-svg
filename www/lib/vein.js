define(['vector2'] , (Vector2)=>{
    return class Vein {
        constructor(draw , path , color , time  , startEase , endEase , radius , stretch , node) {
            var vessel = draw.path(path).fill("none") ;
            var up_blob = draw.path("").fill(color||"red") ;
            var bot_blob = draw.path("").fill(color||"red") ;
            var out_blob = draw.circle(0).fill("none") ;

            // vessel.stroke({ color : "blue" , width : 1 , linecap : "round"}) ;

            this.Vessel = vessel ;
            this.Up_Blob = up_blob ;
            this.Bot_Blob = bot_blob ;
            this.Out_Blob = out_blob ;

            this.StrokeWidth = 2 ;

            this.time = time ;
            this.startEase = startEase ;
            this.endEase = endEase ;
            this.radius = radius ;
            this.stretch = stretch ;
            this.node = node || false ;
        }
        dmove(x,y) {
            this.Vessel.dmove(x,y) ;
            return this ;
        }
        addTo(group) {
            this.Vessel.addTo(group) ;
            this.Up_Blob.addTo(group) ;
            this.Bot_Blob.addTo(group) ;
            this.Out_Blob.addTo(group) ;
            return this ;
        }
        Fluctuate(loop) {
            var t = this ;
            var time = this.time ;
            var startEase = this.startEase ;
            var endEase = this.endEase ;
            var radius = this.radius ;
            var stretch = this.stretch ;
            var node = this.node ;

            this.Out_Blob.animate(1000*time , '<').during(
                function(pos , morph , eased) {
                    var point , start , end , 
                        vein , up_blob , bot_blob , out_blob , length , 
                        up_outline = "" , bot_outline = "" , 
                        r = 0 , angle , dx , dy , pointCx , pointCy , mid ;

                    vein = t.Vessel ;
                    up_blob = t.Up_Blob ;
                    bot_blob = t.Bot_Blob ;
                    out_blob = t.Out_Blob ;
                    length = t.Vessel.length() ;
                    // if(direction == -1)
                    //     eased = 1-eased ;

                    point = new SVG.Point( vein.pointAt( eased * length ) ) ;
                    start = new SVG.Point(vein.pointAt( (eased - stretch)*length) );
                    end = new SVG.Point(vein.pointAt((eased + stretch)*length ));

                    angle = Vector2.AngleBetween(start , end) + Math.PI/2 ;
                    mid = (startEase+endEase)/2 ;

                    // InterpolateBlobSize() interpolates the size of blob on polyline
                    if(eased > startEase && eased < mid ) {
                        r = radius * Math.stretchLine(startEase , endEase , eased) ;
                        // up_blob.fill("blue") ;
                        // bot_blob.fill("blue") ;
                    }
                    else if( eased < endEase && eased > mid ) {
                        r = radius * (1 - Math.stretchLine(startEase , endEase , eased)) ;
                        // up_blob.fill("blue") ;
                        // bot_blob.fill("blue") ;
                    }
                    else {
                        // up_blob.fill("none") ;
                        // bot_blob.fill("none") ;
                    }

                    var dRX = t.StrokeWidth*Math.cos(angle) ;
                    var dRY = t.StrokeWidth*Math.sin(angle) ;

                    var pointA = new Vector2(start.x+dRX , start.y + dRY) ;
                    var pointE = new Vector2(end.x + dRY , end.y + dRY) ;

                    var centerPoint = new Vector2( (pointA.x+pointE.x)/2 , (pointA.y+pointE.y)/2) ;

                    var disAE = Vector2.Distance(pointA , pointE)/5 ;
                    var angelAE = Vector2.AngleBetween(pointA , pointE) ;
                    var centerAE = new Vector2(r*Math.cos(angelAE + Math.PI/2) + centerPoint.x , r*Math.sin(angelAE + Math.PI/2) + centerPoint.y) ;
                    // var centerAE = new Vector2(r*Math.cos(angelAE + Math.PI/2) + point.x , r*Math.sin(angelAE + Math.PI/2) + point.y) ;
                    var cosAE = Math.cos(angelAE) ;
                    var sinAE = Math.sin(angelAE) ;

                    var pointB = new Vector2(disAE/4*cosAE + pointA.x , disAE/4*sinAE + pointA.y) ;
                    var pointC = new Vector2(disAE*Math.cos(angelAE + Math.PI) + centerAE.x , disAE*Math.sin(angelAE + Math.PI) + centerAE.y ) ;
                    var pointD = new Vector2(disAE*cosAE + centerAE.x , disAE*sinAE + centerAE.y ) ;

                    var ipointA = new Vector2(start.x - dRX , start.y - dRY) ;
                    var ipointE = new Vector2(end.x - dRX , end.y - dRY) ;

                    var icenterPoint = new Vector2( (ipointA.x+ipointE.x)/2 , (ipointA.y+ipointE.y)/2) ;

                    var idisAE = Vector2.Distance(ipointA , ipointE)/5 ;
                    var iangleAE = Vector2.AngleBetween(ipointA , ipointE) ;
                    var icenterAE = new Vector2(-r*Math.cos(iangleAE + Math.PI/2) + icenterPoint.x , -r*Math.sin(iangleAE + Math.PI/2) + icenterPoint.y) ;
                    // var icenterAE = new Vector2(-r*Math.cos(iangleAE + Math.PI/2) + point.x , -r*Math.sin(iangleAE + Math.PI/2) + point.y) ;
                    var icosAE = Math.cos(iangleAE) ;
                    var isinAE = Math.sin(iangleAE) ;

                    var ipointB = new Vector2(idisAE/4*icosAE + ipointA.x , idisAE/4*isinAE + ipointA.y) ;
                    var ipointC = new Vector2(idisAE*Math.cos(iangleAE + Math.PI)+ icenterAE.x , idisAE*Math.sin(iangleAE + Math.PI) + icenterAE.y) ;
                    var ipointD = new Vector2(idisAE*icosAE+icenterAE.x , idisAE*isinAE + icenterAE.y) ;

                    bot_outline = "M"+point.x+" "+point.y+" L"+start.x+" "+start.y+" L"+ipointA.x+" "+ipointA.y+" Q"+ipointB.x+" "+ipointB.y+" "+ipointC.x+" "+ipointC.y+" T"+ipointD.x+" "+ipointD.y+" "+ipointE.x+" "+ipointE.y+" L"+end.x+" "+end.y+" Z" ;
                    up_outline = "M"+point.x+" "+point.y+" L"+start.x+" "+start.y+" L"+pointA.x+" "+pointA.y+" Q"+pointB.x+" "+pointB.y+" "+pointC.x+" "+pointC.y+" T"+pointD.x+" "+pointD.y+" "+pointE.x+" "+pointE.y+" L"+end.x+" "+end.y+" Z" ;
            
                    up_blob.plot(up_outline) ;
                    bot_blob.plot(bot_outline) ;
                }
            ).after(function() {
                // if(loop)
                    t.Fluctuate(true) ;
                if(node)
                    for(var i = 0 ; i < node.length ; i++) 
                    node[i].Fluctuate() ;
            }) ;
        }
    }
})