"use strict"
define(function (require) {
    var WSVG = require('wsvg')
    var Body = require('body')
    var Vector2 = require('vector2')
    var Line2 = require('line2')
    var Circle = require('circle')
    // var Exhaust = require('exhaust')
    var Chip = require('chip')

    SVG.extend(SVG.Path , {
        divideToLine : function(lines,closePath) {
            var length , step , points , i , start , end

            length = this.length()
            step = length/lines
            points = []

            for(i = 1 ; i <= lines ; i++) {
                var a , b
                a = this.pointAt((i-1)*step)
                b = this.pointAt(i*step)

                points.push(new Line2(
                    new Vector2(a.x,a.y) ,
                    new Vector2(b.x,b.y)
                ))
                // points.push([[a.x,a.y],[b.x,b.y]])
            }
        
            if(closePath) {
                // closing the path
                start = this.pointAt(0)
                end = this.pointAt(length)
                points.push(new Line2(
                    new Vector2(start.x,start.y) ,
                    new Vector2(end.x,end.y)
                ))
                // points.push([[start.x,start.y],[end.x,end.y]])
            }

            return points
        } ,
        // Passing draw , draws the nodes or it deletes the drawn elements
        simulateAllPoint : function(draw){
            if(this.objects === undefined) this.objects = []

            for(var i = this.objects.length-1 ; i >= 0 ; i--) {
                this.objects[i].remove()
                this.objects.pop()
            }

            try {
                var pathArray = this.deepArrayPath(true) ;
                var length = pathArray.length

                for(var i = 0 ; i < length ; i++)
                    for(var j = 0 ; j < pathArray[i].length ; j++)
                        this.objects.push(draw.circle(5).move(pathArray[i][j][0]-2.5,pathArray[i][j][1]-2.5).fill("cyan"))

                for(var i = 0 ; i < length ; i++) {
                    var points = pathArray[i]
                    let length = points.length-1

                    if(length==2)
                        this.objects.push(draw.line(points[1][0] , points[1][1] , points[2][0] , points[2][1]).stroke({width:1,color:"yellow",dasharray:[5,5] , linecap:"round"}))

                    if(pathArray[i+1]) {
                        var nextPoints = pathArray[i+1]       
                        this.objects.push(draw.line(points[length][0] , points[length][1] , nextPoints[0][0] , nextPoints[0][1]).stroke({width:1,color:"yellow",dasharray:[5,5] , linecap:"round"}))
                    }
                }
            }
            catch(e) {
                throw e
            }

            return this
        },
        // Takes deepArrayPath and plots it to curve
        applyDeepArrayPath : function(deepArrayPath) {
            var path = []
            path.push(["M" , deepArrayPath[0][0][0] , deepArrayPath[0][0][1]])// , pathArray[i][1][0] , pathArray[i][1][1]])
            deepArrayPath.shift()
            while(deepArrayPath.length > 0) {
                var points
                switch(deepArrayPath[0].length) {
                    case 2 :
                        points = ["Q"]
                        break
                    case 3 :
                        points = ["C"]
                        break
                    default :
                }
                
                deepArrayPath[0].forEach((value)=>points.push(...value))
                path.push(points)
                deepArrayPath.shift()
            }
            // console.log(path)
            this.plot(path)
        } ,
        // returns this format [[[x,y] , [x1,y1] , ...] , [[x2,y2] , [x3,y3] , ...] , ....]
        deepArrayPath : function(copy) {
            var pathArray = JSON.parse(JSON.stringify(this.array().value))
            pathArray.forEach((value,index)=>{
                // Removes the first index of each index since the svg.patharray() returns type of curve in the first index of each array
                value.shift()
                // Encapsulates the x,y,...xn,y into [x,y] ,...., [xn,yn]
                var tempValue = []
                while(value.length%2 == 0 && value.length != 0) {
                    tempValue.push([value[0],value[1]])
                    value.splice(0,2)
                }
                pathArray[index] = tempValue
            })
            // pathArray.shift()
            if(copy)
                return JSON.parse(JSON.stringify(pathArray))
            else
                return pathArray
        },
        // TODO: Cubic path is throwing error . Fix
        // CONVERTS THE PATH to cubic path
        convertToCubicPath : function() {
            var pathArray , cubicArray , previousNode
            pathArray = this.deepArrayPath(true)

            // Converts our path to cubic form enabling us to insert a point on the curve
            cubicArray = []
            previousNode = pathArray[0]

            cubicArray.push(Object.assign([] , ...pathArray[0]))
            for(var i = 1 ; i < pathArray.length ; i++) {
                var m = []
                if(pathArray[i].length < 3) {
                    // Elevating if not cubic curve
                    m = ElevateDegreeBezierCurve([previousNode[previousNode.length-1] , ...pathArray[i]])
                    // Elevating once more if path was linear curve
                    if(m.length < 4)
                        m = ElevateDegreeBezierCurve(m)

                    m.shift()
                }
                else {
                    m = pathArray[i]
                }
                // removing the first element
                
                var points = ["C"]
                m.forEach((value)=>points.push(...value))
                cubicArray.push(points)
                previousNode = pathArray[i]
                // pathArray.splice(i,1,ElevateDegreeBezierCurve( [...path[i-1] , ...path[i]] )) 
            }
            //since this is the first point for now
            cubicArray[0].unshift("M")
            // TODO: Should i clear/resetPath/reset the path before plotting ?
            
            this.plot(cubicArray)

            return this
        }
    })

    class Line {
        constructor(a,b){
            this.a = a 
            this.b = b
        }
    }
    class Debug {
        static set draw(draw) {
            this._draw = draw
        }
        static Clear() {
            if(this.points) {
                while(this.points.length > 0) {
                    this.points[this.points.length-1].remove()
                    this.points.pop()
                }
            }
            if(this.lines) {
                while(this.lines.length > 0) {
                    this.lines[this.lines.length-1].remove()
                    this.lines.pop()
                }
            }
        }
        /**
         * @param point : [x,y]
         */
        static Point(...point) {
            if(this.points == null)
                this.points = []
            for(var i = 0 ; i < point.length ; i++)
                this.points.push(this._draw.circle(8).move(point[i].x-4 , point[i].y-4).fill("red"))
        }

    
        static Line(...lines) {
            if(this.lines == null)
                this.lines = []
            for(var i = 0 ; i < lines.length ; i++)
                this.lines.push(this._draw.line(lines[i].a.x , lines[i].a.y , lines[i].b.x , lines[i].b.y).stroke({color:"white" , width:2}))
        }
        static Console(...param) {
            if(this.msg != null)
                this.msg.remove()

            var msg = param[0]
            for(var i = 1 ; i < param.length ; i++)
                msg+= " , "+param[i]
            
            this.msg = this._draw.text(msg).move(100,100).font({ fill: '#f06', family: 'Inconsolata' })
        }
    }

    // console.log(6/2*(2+1)) ;

    class Node {
        constructor(x,y,draw,t) {
            this.x = x || 0 ;
            this.y = y || 0 ;
            
            this.drag = false ;
            this.circle = draw.circle(12).fill("cyan").move(x,y) ;

            // var node = new Node(x , y , draw) ;
            
            this.circle.mousedown(function(e) {
                this.drag = true ;
            }.bind(this)) ;
            this.circle.mouseup(function(e) {
                this.drag = false ;
            }.bind(this)) ;
        
            document.addEventListener("mousemove" , function(e) {
                if(this.drag) {
                    var x = e.clientX - 25 ;
                    var y = e.clientY - 17 ;
                    this.x = x ;
                    this.y = y ;
                    this.circle.move(x,y) ;
        
                    t.Update()  ;
                }
            }.bind(this));
        }
    }


    class Polyline {
        constructor(draw,nodeLength) {
            this.nodes = [] ;
            this.path = "" ;

            var poly = draw.path(this.path).fill("none") ;
            poly.stroke({color:"white", width:1 , linecap:"round"}) ;

            for(var i = 0 ; i < nodeLength ; i++) {
                var point = new Node(i*100 , 0 , draw , this) ;
                this.nodes.push(point) ;
                
                if(i==0)
                    this.path += "M "+point.x+","+(point.y-2) ;
                else {
                    this.path += " L"+point.x+","+(point.y-2) ;
                }
            }
            poly.plot(this.path) ;
            this.line = poly ;
        }
        Update() {
            this.path = "" ;
            for(var i = 0 ; i < this.nodes.length ; i++) {            
                if(i==0)
                    this.path += "M "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2) ;
                else
                    this.path += " L"+(this.nodes[i].x+6)+","+(this.nodes[i].y-2) ;
            }
            this.line.plot(this.path) ;
        }
    }

    // FIXME: fix me lol
    class BezierCurveCubic {
        constructor(draw,nodeLength) {
            this.nodes = [] ;
            this.path = "" ;
            
            var poly = draw.path(this.path).fill("none") ; 
            poly.stroke({ color: 'cyan', width: 2, linecap: 'round' }) ;
            
            for(let i = 0 ; i < nodeLength ; i++) {
                switch(i) {
                    case 0 :
                        var point = new Node(i*100 , 0 , draw , this)
                        this.nodes.push(point)
                        this.path += "M "+point.x+","+point.y
                        break
                    default :
                        for(let j = 0 ; j < 3 ; j++) {
                            var point = new Node(((i)*(j+1))*100 , 0 , draw , this)
                            this.nodes.push(point)

                            switch(j) {
                                case 0 :
                                    this.path += " C "+point.x+" "+point.y
                                    break
                                default :
                                    this.path += " "+point.x+" "+point.y
                                    break
                            }
                        }
                        break
                }
            }
            poly.plot(this.path)
            this.line = poly
        }
        Update() {
            this.path = ""
            for(let i = 0 ; i < this.nodes.length ; i++) {
                if(i == 0) {
                    this.path += "M "+(this.nodes[i].x + 6)+","+(this.nodes[i].y-2)
                }
                else {
                    if((i+2) % 3 == 0) {
                        this.path += "C "+(this.nodes[i].x + 6)+","+(this.nodes[i].y-2)
                    }
                    else {
                        this.path += " "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2)
                    }
                }
            }
            this.line.plot(this.path)

            // for(var i = 0 ; i < this.nodes.length ; i++) {            
            //     if(i==0)
            //         this.path += "M "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2)+" Q" ;
            //     else if(i==1)
            //         this.path += " "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2) ;
            //     else if(i==2)
            //         this.path += " "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2)+" T" ;
            //     else
            //         this.path += " "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2) ;
            // }
            // this.line.plot(this.path) ;
        }
    }
    class BezierCurve {
        constructor(draw,nodeLength) {
            this.nodes = [] ;
            this.path = "" ;
            
            var poly = draw.path(this.path).fill("none") ; 
            poly.stroke({ color: 'cyan', width: 2, linecap: 'round' }) ;
            
            for(var i = 0 ; i < nodeLength ; i++) {
                var point = new Node(i*100 , 0 , draw , this) ;
                this.nodes.push(point) ;
                
                if(i==0)
                    this.path += "M "+point.x+","+point.y+" Q" ;
                else {
                    this.path += " "+point.x+","+point.y ;
                }
            }
            poly.plot(this.path) ;
            this.line = poly ;
        }
        Update() {
            this.path = "" ;
            for(var i = 0 ; i < this.nodes.length ; i++) {            
                if(i==0)
                    this.path += "M "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2)+" Q" ;
                else if(i==1)
                    this.path += " "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2) ;
                else if(i==2)
                    this.path += " "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2)+" T" ;
                else
                    this.path += " "+(this.nodes[i].x+6)+","+(this.nodes[i].y-2) ;
            }
            this.line.plot(this.path) ;
        }
    }

    class Gear {
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
            var diagonalLength = Math.sqrt(2*Square(radius)) ;

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


    class Vein {
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

                    angle = AngleBetween(start , end) + Math.PI/2 ;
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

                    var disAE = Distance(pointA , pointE)/5 ;
                    var angelAE = AngleBetween(pointA , pointE) ;
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

                    var idisAE = Distance(ipointA , ipointE)/5 ;
                    var iangleAE = AngleBetween(ipointA , ipointE) ;
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

    class Repository {
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
    class Wing {
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
    // class Chip {
    //     move(x,y) {
    //         this.leftWing.move(x-215+174,y-94+97.5) ;
    //         this.rightWing.move(x-215+239,y-94+97.5) ;
    //         this.leftWing.Outline.flip("x") ;// it is necessary to move before flipping

    //         this.rect.move(x,y) ;
    //         this.rightNode.move(x-500,y-455) ;
    //         this.leftNode.move(x-500,y-455) ;
    //     }
    //     animate() {
    //         var draw = this.draw ;
    //         this.leftWing.Open(900 , "M 689,298 Q 912,297 1144,344 T 1281,493 1071,600 882,483 689,338").after(function(){
    //             // for(var i = 0 ; i < this.leftRepoistories.length ; i++) {
    //             //     this.leftRepoistories[i].show(250) ;
    //             // }
    //         }.bind(this)) ;
    //         this.rightWing.Open(900 , "M 689,298 Q 912,297 1144,344 T 1281,493 1071,600 882,483 689,338" , beetlebird.R_Shell) ;

    //         var lineProperties = {color:"#FFFFFF" , width:2 , linecap:"round" , miterlimit:10} ;
    //         // Right Node
    //         this.rightNode.add(draw.line(516.646,492.042,531.604,492.042).stroke(lineProperties)) ;
    //         this.rightNode.add(draw.line(531.604,463.625,516.646,463.625).stroke(lineProperties)) ;
    //         this.rightNode.add(draw.line(511.25,485.375,543,485.375).stroke(lineProperties).dmove(-1,1.5)) ;
    //         this.rightNode.add(draw.line(543,470.292,511.25,470.292).stroke(lineProperties).dmove(-1,-1.5)) ;

    //         lineProperties.width = 1.7;
    //         this.rightNode.add(draw.line(508.104,480.875,540.146,480.875).stroke(lineProperties).dmove(0,1)) ;
    //         this.rightNode.add(draw.line(540.146,474.792,508.104,474.792).stroke(lineProperties).dmove(0,-1)) ;

    //         lineProperties.width = 0.7 ;
    //         this.rightNode.add(draw.line(545.979,477.833,517.577,477.833).stroke(lineProperties)) ;


    //         var path , endPoint ;
    //         // Left Node
    //         lineProperties.width = 1.8 ;
    //         var path = draw.path().M(507.207,463.625).L(492.25,463.625).stroke(lineProperties) ;
    //         var endPoint = draw.circle(0).fill("white").center(492.25,463.625) ;
    //         path.drawAnimated().after(function() {
    //             this.animate(250).radius(2.1) ;
    //         }.bind(endPoint)) ;
    //         this.leftNode.add(path) ;
    //         this.leftNode.add(endPoint) ;

    //         var path = draw.path().M(507.207,492.042).L(492.25,492.042).stroke(lineProperties) ;
    //         var endPoint = draw.circle(0).fill("white").center(492.25,492.042) ;
    //         path.drawAnimated().after(function() {
    //             this.animate(250).radius(2.1) ;
    //         }.bind(endPoint)) ;
    //         this.leftNode.add(path) ;
    //         this.leftNode.add(endPoint) ;

    //         lineProperties.width = 1.2 ;
    //         var path = draw.path().M(512.603,485.375).L(480.854,485.375).stroke(lineProperties).dmove(-1,1.5) ;
    //         var endPoint = draw.circle(0).fill("white").center(480.854,485.375).dmove(-1,1.5) ;
    //         path.drawAnimated().after(function() {
    //             this.animate(100).radius(1.75) ;
    //         }.bind(endPoint)) ;
    //         this.leftNode.add(path) ;
    //         this.leftNode.add(endPoint) ;

    //         var path = draw.path().M(512.603,470.292).L(480.854,470.292).stroke(lineProperties).dmove(-1,-1.5) ;
    //         var endPoint = draw.circle(0).fill("white").center(480.854,470.292).dmove(-1,-1.5) ;
    //         path.drawAnimated().after(function() {
    //             this.animate(100).radius(1.75) ;
    //         }.bind(endPoint)) ;
    //         this.leftNode.add(path) ;
    //         this.leftNode.add(endPoint) ;

    //         lineProperties.width = 0.9;
    //         var path = draw.path().M(515.75,480.875).L(483.707,480.875).stroke(lineProperties).dmove(-16,1) ;
    //         var endPoint = draw.circle(0).fill("white").center(483.707,480.875).dmove(-16,1) ;
    //         path.drawAnimated().after(function() {
    //             this.animate(100).radius(1.5).after(function(){
    //                 var stroke = {color:"white",width:0.9};
    //                 var p = draw.path().M(634,320.45).L(598,332).L(534,332).L(480,375).fill("none").stroke(stroke) ;
    //                 p.drawAnimated({duration:2000}).after(function(){
    //                     var p1 = draw.path().M(480,375).L(415,428).L(299,428).L(256,461).L(172,461).fill("none").stroke(stroke) ;
    //                     p1.drawAnimated({duration:2000}).after(function(){
    //                         new Repository(draw , "Repo Name" , 50 , 52 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(172,461).show(250) ;
    //                     }.bind(this));
    //                     var p2 = draw.path().M(480,375).L(465,365).L(430,365).fill("none").stroke(stroke) ;
    //                     p2.drawAnimated().after(function() {
    //                         var p1 = draw.path().M(430,365).L(390,365).fill("none").stroke(stroke) ;
    //                         p1.drawAnimated() ;
    //                         var p2 = draw.path().M(430,365).L(400,390).L(335,390).fill("none").stroke(stroke) ;
    //                         p2.drawAnimated().after(function(){
    //                             new Repository(draw , "Repo Name" , 40 , 42 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(335,390).show(250) ;
    //                         });
    //                     }) ;
    //                 }.bind(this)) ;
    //             }.bind(this)) ;
    //         }.bind(endPoint,this)) ;
    //         this.leftNode.add(path) ;
    //         this.leftNode.add(endPoint) ;

    //         var path = draw.path().M(515.75,474.792).L(483.707,474.792).stroke(lineProperties).dmove(-16,-1) ;
    //         var endPoint = draw.circle(0).fill("white").center(483.707,474.792).dmove(-16,-1) ;
    //         path.drawAnimated().after(function() {
    //             this.animate(100).radius(1.5) ;
    //         }.bind(endPoint)) ;
    //         this.leftNode.add(path) ;
    //         this.leftNode.add(endPoint) ;

    //         lineProperties.width = 0.7 ;
    //         var path = draw.path().M(506.276,477.833).L(477.875,477.833).stroke(lineProperties).dmove(7,0) ;
    //         var endPoint = draw.circle(0).fill("white").center(477.875,477.833).dmove(7,0) ;
    //         path.drawAnimated().after(function() {
    //             this.animate(100).radius(1.5) ;
    //         }.bind(endPoint)) ;
    //         this.leftNode.add(path) ;
    //         this.leftNode.add(endPoint) ;
    //     }
    //     constructor(draw) {
    //         this.draw = draw ;
    //         this.leftWing = new Wing(draw , "M 701,282 Q 712,282 726,284 T 742,297 737,309 721,306 701,320").opacity(0) ;
    //         this.rightWing = new Wing(draw , "M 701,282 Q 712,282 726,284 T 742,297 737,309 721,306 701,320").opacity(0) ;

    //         this.rect = draw.path('M524.271,498c0,1.657-1.343,3-3,3h-18.543c-1.657,0-3-1.343-3-3v-39.333 c0-1.657,1.343-4,3-4h18.543c1.657,0,3,1.343,3,3V498z').fill("#FFFFFF") ;
    //         this.rightNode = draw.group() ;
    //         this.leftNode = draw.group() ;

    //         // this.leftRepoistories = []
            
    //         // this.leftRepoistories.push(new Repository(draw , "Repo Name" , 50 , 52 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(143,435)) ;

    //         // var m = draw.path().M(634,320).L(598,332).L(534,332).L(480,375).fill("none").stroke({color:"white"}) ;
    //         // var m1 = draw.path().M(480,375).L(415,428).L(299,428).L(256,461).L(172,461).fill("none").stroke({color:"white"}) ;
    //         // var m1 = draw.path().M(480,375).L(50,50).fill("none").stroke({color:"white"}) ;
    //         // M 634,320 L598,332 L534,332 L480,375 L299,428 L256,461 L172,461 L706,-2 L806,-2 L906,-2
    //     }
    // }


    class Trail {
        constructor(draw , x , y , refX , refY , radius , length ,stretch,startOpacity,filter) {
            class Node {
                constructor(x,y,radius,length,opacity,stretch,startOpacity,filter) {
                    this.node = draw.circle(radius).move(x,y).fill("white") ;
                    this.node.opacity(opacity) ;
                    this.node.filter(filter) ;
                    this.stretch = stretch ;
                    if(length>0)
                        this.childNode = new Node(x,y,radius,--length,opacity-startOpacity/length,stretch,startOpacity,filter) ;
                }
                removeNextNodeFill() {
                    if(this.childNode) {
                        // this.childNode.removeNextNodeFill() ;
                        if(this.node.attr('fill') == "none") {
                            // console.log(this.node.attr('fill')) ;
                            this.childNode.removeNextNodeFill() ;
                        }
                        else
                            this.node.fill("none") ;
                        // if(this.node.attr('fill') == "none") {
                            // this.childNode.node.fill("none") ;
                        // }
                    }
                }
                moveNodes() {
                    // if child node then move them relative to current node , 0.4 is distance between two nodes
                    if(this.childNode) {
                        // console.log(this.stretch) ;
                        var x = this.childNode.node.x()+(this.node.x()-this.childNode.node.x())*this.stretch;
                        var y = this.childNode.node.y()+(this.node.y()-this.childNode.node.y())*this.stretch ;
                        this.childNode.node.move(x,y) ;

                        // var r = this.childNode.node.attr("r")+(this.node.attr("r")-this.childNode.node.attr("r")) ;
                        // this.childNode.node.size(r) ;
                        this.childNode.moveNodes() ;

                        // if(this.node.attr('fill') == "none") {
                        //     this.childNode.node.fill("none") ;// == "none" ;
                        // }
                        // else {
                        //     // this.node.fill("none") ; // == "none" ;
                        // }
                    }
                }
                // sizeNodes(r) {
                //     if(this.childNode) {
                //         this.childNode.node.size(r) ;
                //         this.childNode.sizeNodes(r) ;
                //     }
                // }
                deleteNodes() {
                    if(this.childNode) {
                        this.childNode.node.remove() ;
                        this.childNode.deleteNodes() ;
                    }
                }
                // deleteNodesAfter() {
                //     if(this.childNode) {

                //     }
                // }
            }
            this.leader = new Node(x,y,radius,length,startOpacity,stretch,startOpacity,filter) ;
            this.leader.node.fill("none") ;
            this.referenceOrigin = new Vector2(refX,refY) ;
            this.fillCount = 0 ;
        }
        deleteAfter() {
            this.leader.node.remove() ;
            // this.leader.deleteNodesAfter() ;
        }
        move(x,y,r) {
            this.leader.node.move(x,y) ;
            // this.leader.node.size(r) ;
            this.leader.moveNodes() ;
            return this ;
        }
        // size(r) {
        //     this.leader.node.size(r) ;
        //     this.leader.sizeNodes(r) ;
        // }
        delete() {
            this.leader.node.remove() ;
            this.leader.deleteNodes() ;
        }
    }

    class Particle {}
    class PathParticle extends Particle {
        constructor(draw) {
            super(draw) ;
            this.path = draw.path("M 689,510 Q 762,584 811,535 T 846,379 757,255").fill("none") ; //.stroke({color:"blue" , width:3}) ;
            var filter = new SVG.Filter() ;
            filter.gaussianBlur(5) ;

            this.mainStream = new Trail(draw , this.path.pointAt(0).x , this.path.pointAt(0).y , this.path.pointAt(0).x , this.path.pointAt(0).y , 6 , 130 , 0.4 , 1 , filter) ;

            this.path.animate(7000 , '<').during(
                function(pos , morph , eased) {
                    var length = this.path.length() ;
                    var point = new SVG.Point(this.path.pointAt(eased*length)) ;
                    this.mainStream.move(point.x , point.y) ;

                    var rand = Math.random() ;
                    if(rand < (1-eased)*0.1) { // rand < 0.1*eased min probability at eased = 0 and max at eased = 1
                        var side = Math.random() > 0.7 ? 1 : -1 ; // left or right

                        var randomEase = eased - Math.random()*5/50 ;
                        var randomPoint = new SVG.Point(this.path.pointAt(length*(randomEase))) ;

                        var start = new SVG.Point(this.path.pointAt(((randomEase)-0.1)*length)) ;
                        var end = new SVG.Point(this.path.pointAt(((randomEase)+0.1)*length)) ;

                        var angle = AngleBetween(start , end) ;

                        var refX = Math.cos(angle+ (Math.PI/2)*side )*50+randomPoint.x ;
                        var refY = Math.sin(angle+ (Math.PI/2)*side )*50+randomPoint.y ;
                        // draw.circle(3).fill("yellow").move(refX , refY) ;
                        // draw.circle(3).fill("red").move(point.x , point.y) ;

                        
                        this.trail = new Trail(draw , randomPoint.x , randomPoint.y , refX , refY , 5 , 50 , 0.5,0.7) ;
                        this.trail.leader.node.animate(3000 , '-').during(
                            function(pos , morph , eased) {
                                // var radius = side == 1 ? (1-eased)*3 : eased*3 ;
                                // this.size((1-eased)*5) ;
                                if( eased - this.fillCount/50 >= 0.3) { // 50 is length . Strech , node counts and 0.3 effects the condition for some stupid reason
                                    this.fillCount++ ;
                                    this.leader.removeNextNodeFill() ;
                                }
                                var radius = (1-eased)*10 ;
                                eased = side == 1 ? eased : -eased ;
                                var totalAngle = Math.PI/2 ;
                                var angelFix = -Math.PI/2 * side ;
                                var rotateAngle  = eased * totalAngle * 2 + angelFix + angle ;

                                // console.log(rotateAngle*180) ;
                                var x = Math.cos(rotateAngle)*50 + this.referenceOrigin.x ;
                                var y = Math.sin(rotateAngle)*50 + this.referenceOrigin.y ;
                                this.move(x,y,radius);

                                
                            

                        }.bind(this.trail)).after(
                            function(){ 
                                this.delete() ;
                                // this.deleteAfter() ;
                            }.bind(this.trail)) ;
                    }

                    // this.trail.move(point.x,point.y);
                    // this.trail.leader.node.size((1-eased)*3) ;
                }.bind(this)
            ).loop(true) ;
        }
    }
    

    // OBSOLETE
    function DrawRotatedCurveTest(draw) {
        var totalAmplitude = 20
        angle = 0

    }
    // OBSOLETE
    function DrawCurveTest(draw) {
        var totalAmplitude = 40// amplitude of control point
        var angle =0// angle of control point
        var controlPoint = {x:angle,y:totalAmplitude}
        
        // var distance = Distance() ;

        var a = new Vector2(200,300) //start point
        var eDash = new Vector2(500,300) //end point

        var distance = Distance(a,eDash)
        var curveAngle = AngleBetween(a,eDash)  


        var e = new Vector2(a.x+distance , a.y)
        var c = new Vector2((a.x+e.x)/2 , (a.y+e.y)/2) // center point

        var b = new Vector2((e.x-a.x)*0.2+a.x , c.y-totalAmplitude + (a.y-e.y)/2) // 20% from a point
        var d = new Vector2((e.x-a.x)*0.8+a.x , c.y+totalAmplitude - (a.y-e.y)/2) // 80% from a point

        
        var al = new Vector2(a.x-distance*0.9 , a.y) // 10% behind the a point
        var ar = new Vector2(2*a.x-al.x , 2*a.y-al.y) // reflection of al


        var bl = new Vector2(Math.clamp(a.x , b.x - (b.x-a.x)*0.2 , 2*a.x - al.x)  , 2*a.y - al.y) // 0.2 is width
        // var bl = new Vector2(ar.x , ar.y) // same node ar

        var br = new Vector2(2*b.x-bl.x , 2*b.y-bl.y) // reflection of b left node // add clamping method with width if the curve breaks and node exceeds cl

        

        var cl = new Vector2(Math.clamp(br.x , c.x , -controlPoint.x+c.x) , 2*c.y - Math.max(controlPoint.y+c.y , c.y)) // limitations to inputs for handling center axis contorl points

        // cl = {x:Math.clamp(br.x , c.x , cl.x) , y : Math.clamp(br.y , c.y , cl.y)} // limitations to inputs for handling center axis contorl points
        var cr = new Vector2(2*c.x - cl.x , 2*c.y - cl.y) // reflection of c left node

        var el = new Vector2(e.x-distance*0.1 , e.y) // 10% behind the e point
        var er = new Vector2(2*e.x-el.x , 2*e.y-el.y)// reflection of el

        var dr = new Vector2(el.x , el.y)// same node el

        var dl = new Vector2(2*d.x-dr.x , 2*d.y-dr.y) // reflection of dr
        // console.log(curveAngle*180/Math.PI)
        er.RotateAround(a,curveAngle)
        e.RotateAround(a,curveAngle)
        el.RotateAround(a,curveAngle)

        ar.RotateAround(a,curveAngle)
        al.RotateAround(a,curveAngle)

        bl.RotateAround(a,curveAngle)
        b.RotateAround(a,curveAngle)
        br.RotateAround(a,curveAngle)

        cl.RotateAround(a,curveAngle)
        c.RotateAround(a,curveAngle)
        cr.RotateAround(a,curveAngle)

        dl.RotateAround(a,curveAngle)
        d.RotateAround(a,curveAngle)
        dr.RotateAround(a,curveAngle)

        // e = RotatePoint(a,e,curveAngle)
        // console.log(eDash , RotatePoint(a,e,curveAngle))
        // el = RotatePoint(a,el,curveAngle)
        // er = RotatePoint(a,er,curveAngle)

        // ar = RotatePoint(a,ar,curveAngle)
        // al = RotatePoint(a,al,curveAngle)

        // bl = RotatePoint(a,bl,curveAngle)
        // b = RotatePoint(a,b,curveAngle)
        // br = RotatePoint(a,br,curveAngle)

        // cl = RotatePoint(a,cl,curveAngle)
        // c = RotatePoint(a,c,curveAngle)
        // cr = RotatePoint(a,cr,curveAngle)

        // dl = RotatePoint(a,dl,curveAngle)
        // d = RotatePoint(a,d,curveAngle)
        // dr = RotatePoint(a,dr,curveAngle)


        // var m = draw.path().M(a.x,a.y).C(ar,bl,b).C(br,cl,c).C(cr,dl,d).C(dr,el,e).stroke({width:2,color:"green"}).fill("none") ;
        var m = draw.path().M(a.x,a.y).Q(bl,b).C(br,cl,c).C(cr,dl,d).C(dr,el,e).stroke({width:2,color:"green"}).fill("none") ;

        draw.circle(3).move(a.x,a.y).fill("yellow")
        
        draw.circle(3).move(c.x,c.y).fill("red")
        draw.circle(3).move(d.x,d.y).fill("red")
        draw.circle(3).move(e.x,e.y).fill("red")

        draw.circle(3).move(al.x,al.y).fill("cyan")
        draw.circle(3).move(ar.x,ar.y).fill("cyan")

        draw.circle(3).move(bl.x,bl.y).fill("cyan")
        draw.circle(3).move(br.x,br.y).fill("cyan")

        draw.circle(5).move(cl.x,cl.y).fill("red")
        draw.circle(5).move(cr.x,cr.y).fill("green")

        draw.circle(3).move(el.x,el.y).fill("cyan")
        draw.circle(3).move(er.x,er.y).fill("cyan")

        draw.circle(3).move(dr.x,dr.y).fill("cyan")
        draw.circle(3).move(dl.x,dl.y).fill("cyan")

        draw.circle(5).move(b.x,b.y).fill("yellow")
    }

    // OBSOLETE
    function InsertPointInCurveTest(draw) {
        // original curve
        var path = draw.path("M 100 350 C 150 150 350 150 400 350").fill("none").stroke({width:2,color:"white"})
        // var centerPoint = PolyBezierCurve(0.5 , [100,350] , [150,150] , [350,150]  , [400,350])
        // console.log(centerPoint)
        // draw.circle(6).move(centerPoint[0]-2.5,centerPoint[1]-2.5).fill("red")

        draw.circle(5).move(100-2.5,350-2.5).fill("red")
        draw.circle(5).move(150-2.5,150-2.5).fill("red")
        draw.circle(5).move(350-2.5,150-2.5).fill("red")
        draw.circle(5).move(400-2.5,350-2.5).fill("red")
        draw.line(100,350 ,150,150).stroke({width:2,color:"red",dasharray:[5,10]})
        draw.line(350,150 ,400,350).stroke({width:2,color:"red",dasharray:[5,10]})

        draw.circle(5).move(256.25-2.5,200-2.5).fill("red") // temp test m point which is in center of the curve

        var time = TimeOnNthBezierCurve(256.25 , [100,350] , [150,150] , [350,150] , [400,350])
        var m = {x:256.25,y:200}

        // testing manually
        var points = InsertPointOnBezierCurve([256.25,200] , 0.5 , [100,350] , [150,150] , [350,150] , [400,350])
        // Elevation test : works
        // var pointsTest = InsertPointOnBezierCurve([200,200] , 0.5 , [100,350] , [250,150] , [400,350])
        // var m = {x:200,y:200}
        // qudratic curve
        // draw.path().M(100,350).C({x:100,y:350} , {x:250,y:150} , {x:400,y:350})
        // cubic curve
        // console.log(pointsTest)
        // var pointsTest = ElevateDegreeBezierCurve([[100,350] , [250,150] , [400,350]])
        // console.log(pointsTest)?
        // draw.line(pointsTest[0][0] , pointsTest[0][1] , pointsTest[1][0] , pointsTest[1][1]).stroke({width:3,color:"yellow",dasharray:[5,5] , linecap:"round"})
        // draw.circle(5).move(pointsTest[0][0]-2.5,pointsTest[0][1]-2.5).fill("blue")
        // draw.line(pointsTest[3][0] , pointsTest[3][1] , pointsTest[2][0] , pointsTest[2][1]).stroke({width:3,color:"yellow",dasharray:[5,5] , linecap:"round"})
        // // draw.circle(5).move(pointsTest[3][0]-2.5,pointsTest[3][1]-2.5).fill("blue")
        // draw.circle(5).move(pointsTest[1][0]-2.5,pointsTest[1][1]-2.5).fill("blue")
        // draw.circle(5).move(pointsTest[2][0]-2.5,pointsTest[2][1]-2.5).fill("blue")

        // draw.path().M(pointsTest[0][0] , pointsTest[0][1]).C({x:pointsTest[1][0] , y:pointsTest[1][1]},{x:pointsTest[2][0] , y:pointsTest[2][1]},{x:pointsTest[3][0] , y:pointsTest[3][1]}).fill("none").stroke({color:"cyan",width:1})
        // return
        var newar = {x:points[1][0] ,y:points[1][1]}
        var newel = {x:points[5][0] ,y:points[5][1]}
        var ml = {x:points[2][0] ,y:points[2][1]}
        var mr = {x:points[4][0] ,y:points[4][1]}


        // var newar = NthBezierCurve(time,[100,350],[150,150])
        // var newel = NthBezierCurve(time,[400,350],[350,150])
        var arTOel = NthBezierCurve(time,[150,150],[350,150])
        // var ml = NthBezierCurve(time,[newar.x,newar.y],[arTOel.x,arTOel.y])
        // var mr = {x:2*m.x - ml.y ,  y : 2*m.y - ml.y} // reflection of ml (test) or the above the definate calucatlations

        // path after inserting points
        var newTestPath = draw.path().M(100,350).C(newar,ml,m).C(mr,newel,{x:400,y:350}).fill("none").stroke({color:"cyan",width:1})

        // draw.circle(5).move(arTOel.x-2.5,arTOel.y-2.5).fill("yellow")

        draw.line(m.x,m.y , ml.x , ml.y).stroke({width:3,color:"yellow",dasharray:[5,5] , linecap:"round"})
        draw.circle(5).move(ml.x-2.5,ml.y-2.5).fill("yellow")

        draw.line(m.x,m.y , mr.x , mr.y).stroke({width:3,color:"yellow",dasharray:[5,5] , linecap:"round"})
        draw.circle(5).move(mr.x-2.5,mr.y-2.5).fill("yellow")

        draw.line(100,350 , newar.x , newar.y).stroke({width:3,color:"yellow",dasharray:[5,5] , linecap:"round"})
        draw.circle(5).move(newar.x-2.5,newar.y-2.5).fill("yellow")

        draw.line(400,350 , newel.x , newel.y).stroke({width:3,color:"yellow",dasharray:[5,5] , linecap:"round"})
        draw.circle(5).move(newel.x-2.5,newel.y-2.5).fill("yellow")
    }

    // OBSOLETE TEST METHOD
    function AnimateAngleOriginTest(draw) {
        var line = draw.path().M(200,200).L(300,300).stroke({width:3,color:"yellow",dasharray:[5,5] , linecap:"round"})

        
        line.animate(5000,'-').during(function(pos,morph,ease){
            var angle = ease * Math.PI*2
            line.resetPath()

            var x = Math.cos(angle) * 100 + 200
            var y = Math.sin(angle) * 100 + 200

            var m = RotatePoint({x:200,y:200} , {x:300 ,y:200} , angle)
            line.M(200,200).L(m.x,m.y)

            console.log(AngleBetween({x:200,y:200} , {x:x,y:y})*180/Math.PI )
        }.bind(line))
    }
    

    class BeetleBird {
        constructor(draw) {
            // TEMP <<
            // var mainGear1 = new Gear(draw , 100 , 17 , -1).move(560,380) ;
            
            // var mainGearNode1 = new Gear(draw , 35 , 7 , 1).move(560 , 480) ;
            // var mainGearNode2 = new Gear(draw , 50 , 12 , -1).move(504 , 465) ;

            // var mainGear2 = new Gear(draw , 80 , 12 , 1).move(550 , 230) ;
            
            // var mainGear2Node1 = new Gear(draw , 30 , 5 , -1).move(516 , 270) ;
            // var mainGear2Node2 = new Gear(draw , 40 , 8 , 1).move(500 , 304) ;
            // var mainGear2Node3 = new Gear(draw , 50 , 10 , -1).move(480 , 350) ;
            // TEMP >>

            // var vessel = draw.path('M507.09,677.829c-0.256-4.329-5.062-4.418-14.79-5.009c-10.045-0.61-17.3,4.93-19.97,14.18 c-2.502,8.67-8.33,24-28.3,25c-18.006,0.901-21.407,2.646-29.35,20.82c-7.18,16.43,4.844,23.95,12.07,27.18 c3.699,1.653,15.75,5.75,10.25-10.999c-8.264-25.165,2-18.431,3.25-24.091s3.75-0.16,2,3.09s-8,0.5,0.75,21.25 s28.24,22.15,40,15.7c11.75-6.45,21.9-21.101,24.09-41.62c1.28-12.021,1.147-22.715,0-27.33c-0.967-3.891-6.756-6.806-9.756-8.666 c-1.54-0.96-15.624-9.307-2.333-5.667c4.795,1.314,7.701,2.57,9.388,3.179c4.513,1.627,6.417,4.405,7.112,6.821 c2.146,7.46,0.5,30.803,0.5,30.803s-2.45,88.19-102.39,36.53c-17.17-8.88-36.21-26.67-45.13-42.53 c-4.98-6.979-6.98-15.72-15.23-18.8c-22.92-2-33.58-25.42-23.61-46.2c2.33-4.87-0.38-11.88-5.92-31.31c0,0-9-29.061-9.81-43.65 c-0.82-14.58-3.66-10.51-10.91-22.01s2.83-33.25,16.67-37.25c13.83-4,10.33-12.76,7.33-20.75c-3-8,2.5-17.91,9.88-20.33 c7.37-2.42,7.12-9.22,2.62-19.45c-4.5-10.22,3.26-29.47,22.63-29.97s18.65-12.78,24.37-22.75c17.08-29.76,47.57-31.13,61.75-26.5 c6.87,2.24,19.7,16.22,35.2,12.83c37.05-8.08,32.27,67.59,32.27,67.59L512,686.083c0,0-0.5,2.584-2.833,0.667 S507.236,680.293,507.09,677.829z M507.09,635.67c0,0,3.08-42.87-28.06-42.87c-12.78,0-8.25,31.72-29.03,33.7 c-26.25,2.5-16.3-31.03-46.75-25.25c-6.11,1.16-12.08,1.58-19.58-0.42c-10.18-2.71-14.05,1.82-15.34,6.92 c-1.66,6.58,1.81,16.56,3.94,21.63c4.05,9.601,15.88,28.45-8.64,40.75c-18.3,9.18,4.03,38.28,4.03,38.28s6.4,13.25,13.67,18.26 c7.27,5,18.21,5.57,24.94-6.189c6.73-11.761,15.836-17.717,34.14-16.15c16.59,1.42,24.544-15.209,26.92-22.43 c2.663-8.093,10.76-13.74,25.71-12.66C508,670.33,507,658.55,507,658.55L507.09,635.67z M505.667,563.334 c1.271-15.962,1.423-64.444,1.423-64.444c0-43.51-2.96-44.2-11.34-40.97c-7.84,3.03-16.5,17.08-28,4.23 c-11.5-12.84-9.75-6.9-25.5-5.43c-8,0.75-13.17-1.24-19.75-0.72c-5.34,0.42-9.86,4.71-20.62,8.75 c-14.88,5.58-26.08,2.1-33.55-1.75c-18.05-9.3-21.76-7.28-22.21-1c-0.3,4.29,0.32,9.66-3.27,18.25 c-4.35,10.37,12.83,14.34,16.71,20.31c0.75,1.16-1.01,4.71-6.3,2.37c-27.51-12.18-15.76,3.57-21.6,11.77 c-18.21,25.6,7.1,30.78,15.85,34.42c9.91,4.12,20.82,8.21,24.72,29.32c2.83,15.34,23.77,21.89,52.77,7.31 c24.52-12.33,25.5-3.25,48.75-1.25C500.9,586.84,504.922,572.688,505.667,563.334z M489,452.22c16-15.47,11.25-23.22,5.5-37.72 s-14.64-18.5-37.07-25.17C435,382.67,406.58,379.91,401,397c-1.87,5.73,7,10.35,10.25,18.8c3.25,8.45,6.47,12.28,20.61,15.87 c14.14,3.58,12.89,6.33,27.39,15.08S473,467.69,489,452.22z M408.5,452.75c2.08-2.54,2.34-9.72,2.16-12.97 c-1.28-23.03-18.16-45.53-23.38-29.19c-5.22,16.35-12.53,19.91-26.28,27.03s4.5,17.5,9.33,20.3 C378.66,462.76,398.38,465.12,408.5,452.75z M365.02,601.36c2.94-6.29,4.62-11.62,0.73-26c-4.87-17.98-16.59-18.86-23.67-22.03 c-35.08-15.66-22.41,25.67-21.2,36.34c1.22,10.66,13.45,51.33,13.45,51.33s-0.15,25.48,19.97,20.29 c20.12-5.18,12.52-22.75,9.33-33.78C360.44,616.49,361.78,608.26,365.02,601.36z') ;

            var logicalBody = new Body.Logical(draw,"M511.866,414L512,392c0,0-16.271-5.916-39-4 c-19.006,1.602-41.519-9.838-61-3.84c-20.702,6.374-17.977,17.732-35.11,35.065C356.343,440.012,342.431,449,340.041,481 c-1.445,19.351-21.973,39.318-27.041,61.5c-3.437,15.042-1.88,31.663,3,48.833c9.188,32.329,16.341,59.971,29,87.98 c11.837,26.189,25.75,51.187,46.477,65.313c93.127,51.872,121.648,37.373,120.027-85C510.298,568.569,512.011,506.688,512,468",50,2)
            var musicalBody = new Body.Musical(draw,"M511.866,421.667L512,392c0,0,92.4-30.334,148.367,41 s69.209,253.666-28.412,312.5s-119.926,31.834-120.028-85c-0.08-91.065,0.208-161.812,0.219-200.5",50,2).AttachBodyToSuctionPoint(logicalBody)

            var l_eye = draw.path('M487.514,266.308c0,0-0.005-0.186-0.016-0.534c-0.005-0.174-0.011-0.389-0.019-0.641 c-0.021-0.208-0.045-0.446-0.072-0.712c-0.056-0.525-0.171-1.258-0.376-2.045c-0.187-0.801-0.491-1.696-0.864-2.668 c-0.776-1.937-1.97-4.139-3.486-6.395c-1.519-2.255-3.33-4.571-5.215-6.857c-0.945-1.152-1.889-2.304-2.819-3.438 c-0.921-1.152-1.827-2.298-2.594-3.529c-0.386-0.609-0.734-1.252-0.972-1.962c-0.124-0.338-0.198-0.761-0.21-1.114 c-0.016-0.301-0.004-0.725,0.045-1.048c0.18-1.371,0.764-2.542,1.453-3.467c0.697-0.925,1.516-1.634,2.368-2.048 c0.426-0.204,0.865-0.333,1.287-0.33c0.421-0.002,0.808,0.158,1.057,0.396c0.496,0.497,0.557,1.058,0.61,1.392 c0.037,0.348,0.041,0.534,0.041,0.534s-0.019-0.186-0.084-0.526c-0.076-0.324-0.2-0.87-0.678-1.269 c-0.481-0.413-1.325-0.328-2.058,0.129c-0.747,0.442-1.458,1.171-2.026,2.076c-0.564,0.904-0.992,2.015-1.044,3.195 c-0.015,0.312-0.006,0.539,0.038,0.889c0.04,0.297,0.103,0.534,0.23,0.815c0.235,0.544,0.585,1.094,0.992,1.626 c0.801,1.073,1.774,2.117,2.772,3.168c1.018,1.048,2.052,2.112,3.086,3.176c2.083,2.134,4.136,4.342,5.926,6.569 c1.787,2.229,3.291,4.5,4.358,6.623c0.52,1.068,0.96,2.08,1.269,3.021c0.328,0.942,0.535,1.761,0.683,2.517 c0.066,0.376,0.126,0.712,0.178,1.004c0.028,0.251,0.053,0.464,0.072,0.638c0.04,0.346,0.061,0.531,0.061,0.531L487.514,266.308z') ;
            var r_eye = draw.path('M532.496,265.026c0,0,0.021-0.185,0.061-0.531c0.02-0.173,0.044-0.387,0.072-0.638 c0.052-0.292,0.111-0.628,0.178-1.004c0.147-0.756,0.355-1.575,0.683-2.517c0.309-0.941,0.749-1.953,1.269-3.021 c1.067-2.124,2.571-4.394,4.358-6.623c1.79-2.227,3.843-4.435,5.927-6.569c1.033-1.064,2.067-2.128,3.086-3.176 c0.997-1.052,1.971-2.095,2.771-3.168c0.407-0.533,0.757-1.083,0.992-1.626c0.127-0.282,0.189-0.519,0.229-0.815 c0.044-0.35,0.053-0.577,0.037-0.889c-0.052-1.181-0.479-2.291-1.044-3.195c-0.568-0.905-1.279-1.633-2.025-2.076 c-0.733-0.457-1.577-0.542-2.059-0.129c-0.479,0.399-0.603,0.945-0.678,1.269c-0.065,0.34-0.085,0.526-0.085,0.526 s0.003-0.186,0.04-0.534c0.054-0.334,0.115-0.895,0.611-1.392c0.248-0.239,0.635-0.398,1.057-0.396 c0.421-0.003,0.86,0.126,1.286,0.33c0.852,0.414,1.67,1.123,2.367,2.048c0.69,0.925,1.273,2.096,1.454,3.467 c0.05,0.323,0.061,0.747,0.045,1.048c-0.012,0.353-0.087,0.776-0.21,1.114c-0.238,0.71-0.585,1.353-0.972,1.962 c-0.768,1.23-1.673,2.376-2.595,3.529c-0.93,1.134-1.874,2.286-2.818,3.438c-1.886,2.287-3.696,4.602-5.215,6.857 c-1.517,2.256-2.711,4.458-3.487,6.395c-0.373,0.972-0.677,1.867-0.864,2.668c-0.204,0.787-0.319,1.52-0.375,2.045 c-0.027,0.267-0.052,0.505-0.072,0.712c-0.008,0.252-0.014,0.467-0.019,0.641c-0.011,0.349-0.016,0.534-0.016,0.534 L532.496,265.026z') ;
            var up_mouth = draw.path('M511.667,260c8.333,0,15-1,26.667,3c11.666,4,5,9.333,16.666,9.667 c11.668,0.333,22.667,19,22.667,19S591,322.333,565,316.333s-53.333-4-53.333-4H512c0,0-27.333-2-53.333,4S446,291.667,446,291.667 s11-18.667,22.667-19s5-5.667,16.667-9.667s18.333-3,26.667-3H511.667z') ;
            var bot_mouth = draw.path('M513,312c0,0,30-1.5,48.5,3s30-8.5,41.5,3s48.333,52,15.916,65 C586.5,396,511,397,511,397s-73.5-1-105.917-14S409.5,329.5,421,318s23,1.5,41.5-3s48.5-3,48.5-3H513z') ;

            // var vein__1bbbb = new Vein(draw , 'M 611,591 Q 662,607 672,557 T 657,506' , "#FF4E44" , 6 , 0 , 0.9 , 7 , 0.1 ) ;// ends
            // var vein__1bbr = new Vein(draw , 'M 566,565 Q 575,548 583,540 T 609,532 639,501' , "#FF4E44" , 8 , 0 , 1 , 8 , 0.1 ) ; //ends

            // var vein__1bbbt = new Vein(draw , 'M 618,594 Q 607,580 603,567 T 606,552' , "#FF4E44" , 7 , 0 , 0.9 , 7 , 0.1 ) ;// ends
            // var vein__1bbb = new Vein(draw , 'M 565,562 Q 591,601 611,588' , "#FF4E44" , 6 , 0 , 1 , 7 , 0.13 , [vein__1bbbb , vein__1bbbt] ) ;
            // var vein__1bb = new Vein(draw , 'M 506,496 Q 552,584 573,556' , "#FF4E44" , 5 , 0 , 1 , 7 , 0.13 , [vein__1bbb , vein__1bbr] ) ;

            // var vein__1aaarrb = new Vein(draw , 'M 673,272 Q 673,309 674,355 T 668,409 615,412' , "#FF4E44" , 7 , 0 , 0.9 , 8 , 0.13) ; // ends
            // var vein__1aaarr = new Vein(draw , 'M 597,268 Q 619,266 633,282 T 669,265' , "#FF4E44" , 5 , 0 , 1 , 7 , 0.13 , [vein__1aaarrb]) ; 
            // var vein__1aaar = new Vein(draw , 'M 514,273 Q 557,307 591,269' , "#FF4E44" , 6 , 0 , 1 , 7 , 0.13 , [vein__1aaarr]) ; 
            // var vein__1aaa = new Vein(draw , 'M 496,314 Q 514,297 505,272' , "#FF4E44" , 5 , 0.1 , 1 , 7 , 0.13 , [vein__1aaar]) ; 
            // var vein__1aa = new Vein(draw , 'M 474,367 Q 475,350 487,344 T 493,316' , "#FF4E44" , 5 , 0.1 , 1 , 7 , 0.13 , [vein__1aaa]) ; 
            // var vein__1ba = new Vein(draw , 'M 504,496 Q 470,394 479,358' , "#FF4E44" , 5 , 0 , 1 , 9 , 0.16) ; //ends

            // var vein__1b = new Vein(draw , 'M 538,418 Q 523,433 535,460 T 502,498' , "#FF4E44" , 5 , 0 , 1 , 7 , 0.13 , [vein__1ba , vein__1bb]) ;
            // var vein__1a = new Vein(draw , 'M 536,417 Q 540,374 478,368' , "#FF4E44" , 5 , 0.1 , 1 , 7 , 0.13 , [vein__1aa]) ;

            // var vein__1 = new Vein(draw , 'M 605,412 Q 553,431 535,415' , "#FF4E44" , 4 , 0 , 1 , 9 , 0.2 , [vein__1a , vein__1b]) ;
            // var vein = new Vein(draw , 'M 673,493 Q 681,413 651,413 T 611,414' , "#FF4E44" , 5 , 0.1 , 0.8 , 10 , 0.13 , [vein__1]) ;

            // this.Vein = [vein,vein__1,vein__1a,vein__1b,vein__1ba,vein__1aa,vein__1aaa,vein__1aaar,vein__1aaarr,vein__1aaarrb,vein__1bb,vein__1bbb,vein__1bbbt,vein__1bbr,vein__1bbbb] ;

            // var mainGearOverlap = new Gear(draw , 20 , 5 , -1).move(560+41,380+37).color("red") ; // main
            // var mainGear2Overlap = new Gear(draw , 13 , 0 , 1).move(550+33,230+30).color("red") ; // main

            // var l_wing = new Wing(draw , "M 701,282 Q 712,282 726,284 T 742,297 737,309 721,306 701,320") ;
            // var r_wing = new Wing(draw , "M 701,282 Q 712,282 726,284 T 742,297 737,309 721,306 701,320") ;
            
            

            // var exhaust = new Exhaust(draw, "M521.271,409.75c-4.979-5,0-9.25,0-9.25C510.434,400.358,512,392,512,392l-9.5-7.84 c0.25,4.66-7.016,10.153-10.158,12.748c-0.028,0.023-0.084,0.074-0.117,0.09c-8.94,4.39-16.725,11.322-16.725,21.752 c0,10.179,6.148,18.44,15.383,21.344c0.21,0.066,0.626,0.21,0.835,0.276c12.615,3.963,12.14,11.061,12.531,16.158 c0.671,8.75-1.381,15.642-28.75,20.139c0,0,5,2.833,4,10.833c0,0,5.5-6.896,13-9.448s13.842-5.147,13.776,2.698 s0.167,57.966,0,65.811C506,559.5,500.45,554.108,492.5,550.26c-7.131-3.452-13-10.449-13-10.449c1,8-4,10.834-4,10.834 c11.279,1.853,29.412,9.519,30.371,22.11c1.389,18.237-0.226,38.884-0.621,44.028c-0.391,5.097-0.917,12.194-13.531,16.158 c-0.209,0.065-0.625,0.209-0.835,0.275c-9.235,2.904-15.383,11.166-15.383,21.344c0,10.43,7.914,17.939,16.725,20.752 c4.858,1.551,19.775,5.998,19.775,5.998s-1.566-8.357,9.271-8.5c0,0-4.979-4.25,0-9.25c0,0-9.964,1.094-9.066-11.127 c0.67-9.123,9.066-8.623,9.066-8.623s-4.729-4.25,0-9.25c0,0-8.732,2.443-8.732-17.777V456.528c0-20.222,8.732-17.778,8.732-17.778 c-4.729-5,0-9.25,0-9.25s-8.396,0.5-9.066-8.623C511.308,408.656,521.271,409.75,521.271,409.75z M494.845,430.775 c-6.313,0-11.431-5.118-11.431-11.432c0-6.313,5.118-11.431,11.431-11.431c6.313,0,11.432,5.118,11.432,11.431 C506.276,425.657,501.158,430.775,494.845,430.775z M494.845,665.398c-6.313,0-11.431-5.118-11.431-11.432 c0-6.312,5.118-11.432,11.431-11.432c6.313,0,11.432,5.119,11.432,11.432C506.276,660.28,501.158,665.398,494.845,665.398z")

            var chip = new Chip(draw) ;
            var l_shell = draw.path('M512.072,392.712c0,0-86.82-20.482-139.342-12.247 c-38.033,5.964-124.085,155.712-70.743,284.987c53.344,129.276,152.194,135.539,166.848,122.838 c14.655-12.699,28.639-107.302,32.519-152.251C505.233,591.091,512.072,539.109,512.072,392.712z') ;
            var r_shell = draw.path('M512.072,392.712c0,0,86.807-20.482,139.319-12.247 c38.027,5.964,124.065,155.712,70.731,284.987c-53.335,129.276-152.17,135.539-166.821,122.838 c-14.653-12.699-28.635-107.302-32.514-152.251C518.91,591.091,512.072,539.109,512.072,392.712z') ;
            var out_shell = draw.path("M551.55,783.529c-43.45,9.862-79.101,0-79.101,0l0.005,0.003 c-1.198,2.097-2.406,3.708-3.618,4.759c-14.654,12.701-113.504,6.438-166.848-122.838 c-53.342-129.275,32.709-279.023,70.743-284.987c52.521-8.235,139.342,12.247,139.342,12.247s86.807-20.482,139.319-12.247 c38.027,5.964,124.065,155.712,70.731,284.987c-53.335,129.276-152.17,135.539-166.821,122.838 c-1.224-1.061-2.442-2.691-3.651-4.817") ;
            
        
            

            // vein.Fluctuate(true) ;
            

            // var vein = draw.path("M 653,502 Q 669,427 624,478 T 584,454 644,408").fill("none") ;
            // var up_blob = draw.path("").fill("red") ;
            // var bot_blob = draw.path("").fill("red") ;
            // var out_blob = draw.circle(0).fill("none") ;
            // l_wing.opacity(0.6);
            // r_wing.opacity(0.6);

            l_shell.fill("#ff3333") ;
            r_shell.fill("#ff3333") ;
            out_shell.fill("transparent") ;
            // vessel.fill("#FF4E44") ;

            // vein.stroke({ color : "red" , width : 7 , linecap : "round"}) ;
            // up_blob.stroke({ color : "red" , width : 1 , linecap : "round"}) ;
            // bot_blob.stroke({ color : "red" , width : 1 , linecap : "round"}) ;
            // out_blob.fill("#f06") ;

            // l_eye.fill("#99ff99") ;
            // r_eye.fill("#99ff99") ;
            // up_mouth.fill("#99ceff") ;
            // bot_mouth.fill("#99ceff") ;
            
            // this.Vessel = vessel ;

            this.LogicalBody = logicalBody
            this.MusicalBody = musicalBody
            // this.Exhaust = exhaust

            this.Chip = chip ;
            this.L_Shell = l_shell ;
            this.R_Shell = r_shell ;
            this.Out_Shell = out_shell ; // Outline of shell which is transparent

            this.L_Eye = l_eye ;
            this.R_Eye = r_eye ;
            this.Up_Mouth = up_mouth ;
            this.Bot_Mouth = bot_mouth ;

            // this.L_Wing = l_wing ;
            // this.R_Wing = r_wing ;

            this.x = 0 ;
            this.y = 0 ;

            this.Rotate(5) ;
            this.open = false ;
        }
        // Size(x) {
        //     this.L_Shell.size(x) ;
        //     this.Out_Shell.size(x) ;
        //     this.R_Shell.size(x);

        //     this.L_Eye.size(x) ;
        //     this.R_Eye.size(x) ;
        //     this.Up_Mouth.size(x) ;
        //     this.Bot_Mouth.size(x) ;
        
            
        //     this.L_Wing.size(x) ;
        //     this.R_Wing.size(x) ;
        // }
        Rotate(c) {
            this.L_Shell.rotate(0 , 226 , 15) ;
            this.R_Shell.rotate(0 , 226 , 15) ;

            this.L_Shell.rotate(-c , this.x+ 226, this.y+15) ;
            this.R_Shell.rotate(c , this.x+ 226, this.y+15) ;
        }

        // FIXME: Dont works properly
        Move(x,y) {
            this.x = x ;
            this.y = y ;

            this.LogicalBody.vessel.move(x+11.5,y) ;

            // this.L_Wing.move(x+174,y+97.5) ;
            // this.R_Wing.move(x+239,y+97.5) ;
            // this.L_Wing.Outline.flip("x") ; // it is necessary to move before flipping
        
            this.LogicalBody.move(x+25,y+5)
            this.MusicalBody.move(x+225,y+5)

            // this.Exhaust.move(x+195,y+25)

            this.Chip.move(x+215,y+94) ;

            this.L_Shell.move(x,y) ;
            this.Out_Shell.move(x,y) ;
            this.R_Shell.move(x+226,y) ;

            this.L_Eye.move(x+185,y-140) ;
            this.R_Eye.move(x+245,y-140) ;
            this.Up_Mouth.move(x+157.5,y-110) ;
            this.Bot_Mouth.move(x+107,y-60) ;
        }
        dmove(x,y) {
            this.Move(x+this.x,y+this.y) ;
            this.LogicalBody.dmove(x,y)
            // for(var i = 0 ; i < this.Vein.length ; i++) {
            //     this.Vein[i].dmove(x,y) ;
            // }
        }

        Open(rev) {
            if(!this.open) {
                this.L_Shell.animate(500 , 'swingTo' , 0).rotate(70 , this.x+226 , this.y+15) ; //.reverse(false) ;
                this.R_Shell.animate(500 , 'swingTo' , 0).rotate(-70 , this.x+226 , this.y+15) ;//.reverse(false) ;

                this.Chip.animate() ;
                this.MusicalBody.animate()
                this.LogicalBody.animate()

                this.open = true ;
            }
        }

        Highlight(rev) {
            if(!this.open) {
                var m = rev ? -1 : 1 ;

                this.L_Shell.animate(200 , '<' , 0).rotate(2*m , this.x+226 , this.y+15) ;
                this.R_Shell.animate(200 , '<' , 0).rotate(-2*m , this.x+226 , this.y+15) ;
            }
        }
    }


    if(SVG.supported) 
        Draw() ;
    else
        alert('SVG not supported') ;
    
    var polyline = ""
    function Draw() {

        var draw = SVG('beetlebird')
        Debug.draw = draw


        var bird = new BeetleBird(draw) ;
        bird.Move(450,200) ;

        bird.Rotate(2) ;

        bird.Out_Shell.click( function() {
            bird.Open(false) ;
        } ) ;
        bird.Out_Shell.mouseover( function() {
            bird.Highlight(false) ;
        }) ;
        bird.Out_Shell.mouseout( function() {
            bird.Highlight(true) ;
        }) ;

        // let gummy = draw.path("M438.413,385.188l-71.744-215.833c-1.163-3.499-2.479-6.952-3.948-10.335 c-8.412-19.384-12.587-31.137-21.825-52.044c-1.022-2.313-0.557-5.044,1.255-6.809c0.855-0.832,1.556-1.819,2.027-2.917 c1.921-4.464,0.074-10.231-4.193-12.706c-1.174-0.68-2.177-1.661-2.604-2.949c-1.32-3.985,2.282-4.935,4.382-6.89 c1.905-1.774,2.605-4.574,2.325-7.161c-0.279-2.587-1.424-5.002-2.744-7.245c-2.063-3.506-5-6.981-9.02-7.603 c-3.156-0.487-6.407,0.977-8.602,3.297c-2.194,2.321-3.441,5.397-4.128,8.516c-0.578,2.617-0.795,5.32-1.623,7.869 c-1.072,3.306-3.243,6.203-6.001,8.298l-0.02,0.015c-1.378,1.038-3.225,1.159-4.75,0.355c-16.995-8.961-36.241-13.963-56.393-13.963 c-24.349,0-47.388,7.287-66.712,20.064c-3.147,2.08-7.317,1.715-10.135-0.792l-0.042-0.038c-4.992-4.452-9.246-10.122-15.48-12.548 c-5.326-2.073-11.667-1.356-16.356,1.938c-1.336,0.939-2.476,2.179-3.007,3.724c-1.243,3.615,1.431,6.239,4.197,7.81 c3.538,2.01,7.763,3.123,8.564,8.709c0.157,1.091,0.108,2.217-0.192,3.277c-1.19,4.205-4.925,5.88-8.435,7.425 c-3.124,1.375-6.413,2.912-7.845,6.236c-0.536,1.246-0.635,2.676-0.173,3.951c1.168,3.225,4.464,3.496,7.006,2.536 c1.791-0.677,3.326-1.876,4.935-2.915c1.749-1.129,3.616-2.071,5.557-2.823c1.087-0.42,2.064,0.865,1.364,1.797 c-8.204,10.914-11.119,23.949-15.319,37.537L63.206,385.188c-9.775,31.616,13.86,63.662,46.953,63.662H391.46 C424.554,448.851,448.188,416.805,438.413,385.188z").fill("none").stroke({width : 0})

        // let input = document.getElementById("input")
        // let points = gummy.divideToLine(20 , true)
        // console.log(points)

        // document.getElementById("copy_polylinepath").addEventListener('click' , (e)=>{
        //     var copyText = JSON.stringify(points)
        //     input.value = copyText
        //     console.log(copyText)
        //     /* Select the text field */
        //     input.select();

        //     /* Copy the text inside the text field */
        //     document.execCommand("copy");
        // })
/*

       const { styler, tween, easing ,pointer,interpolate } = window.popmotion;

       const shape = styler(document.querySelector('#target'));

       const circlcPath = 'M607.314,583.006c0,2.032-3.144,2.033-3.144,0C604.171,580.975,607.314,580.975,607.314,583.006 C607.314,583.874,607.314,582.139,607.314,583.006z'
       const muscialNote = 'M616.236,579.648c-0.04,0.206-0.317,0.267-0.428,0.086c-0.34-0.561-1.13-1.312-2.878-1.107 c-0.758,0.091-3.282,0.272-4.597-0.514V588.7c0,0.015-0.002,0.027-0.004,0.042c-0.043,2.438-2.404,4.688-5.312,5.047 c-2.936,0.359-5.315-1.346-5.315-3.812c0-2.465,2.38-4.755,5.315-5.115c1.619-0.2,3.065,0.233,4.04,1.071v-13.12 c0-0.323,0.243-0.588,0.557-0.629v-0.004c0,0,0.03-0.003,0.078-0.004c0,0,0.003-0.001,0.004-0.001s0.001,0.001,0.002,0.001 c0.228-0.008,0.95,0.027,2.026,0.695c1.311,0.814,1.311,2.513,3.631,3.242C614.441,576.453,616.654,577.446,616.236,579.648z'
       const morph = polymorph.interpolate([circlcPath , muscialNote], { 
            origin: { x: 0, y: 0 },
            precision: 10 
        });
       
       tween({
         duration: 1700,
         ease: easing.easeInOut,
         flip: Infinity
       }).pipe(morph)
         .start(shape.set('d'));

*/

   /*     
        // bird.dmove(20,20); // this is bugged

        // var trail = new Trail(draw) ;
        // var pathParticle = new PathParticle(draw) ;
        // var trail = new Trail(draw , 3 , 10 , 0.1).instantMove(400,400) ;

        // trail.leader.animate(6000,'<').move(800,400).move(700,100).loop(true).during(function(pos,morph,ease){
        //     this.move(this.leader.attr("x"),this.leader.attr("y")) ;
        // }.bind(trail)) ; 
        
    */
        // var left_body_temp = "M511.866,414L512,392c0,0-16.271-5.916-39-4 c-19.006,1.602-41.519-9.838-61-3.84c-20.702,6.374-17.977,17.732-35.11,35.065C356.343,440.012,342.431,449,340.041,481 c-1.445,19.351-21.973,39.318-27.041,61.5c-3.437,15.042-1.88,31.663,3,48.833c9.188,32.329,16.341,59.971,29,87.98 c11.837,26.189,25.75,51.187,46.477,65.313c93.127,51.872,121.648,37.373,120.027-85C510.298,568.569,512.011,506.688,512,468"
        // var right_body_temp = "M511.866,421.667L512,392c0,0,92.4-30.334,148.367,41 s69.209,253.666-28.412,312.5s-119.926,31.834-120.028-85c-0.08-91.065,0.208-161.812,0.219-200.5"
        // // draw , path , precision , moist , suctionPoint

        // var bodyL = new Body.Logical(draw,left_body_temp,50,2)
        // var bodyM = new Body.Musical(draw,right_body_temp,50,2)
        // bodyM.AttachBodyToSuctionPoint(bodyL)

        // Debug.Line(...bird.MusicalBody.body)
        // Debug.Point(bodyM.wormHole.position)
        // draw.circle(400).move(bodyM.wormHole.position.x - 200, bodyM.wormHole.position.y - 200).fill("none").stroke({width:1})
        // bodyM.Start(draw)
        // bodyL.Start(draw)
        // bodyM.test_PrebakeParticles(draw)

    /*
        // var path = draw.path("M 100 350 C 100 300 150 250 200 250 C 400 250 400 450 450 350 C 500 250 550 150 600 200 C 650 250 750 100 750 200")
        
        // var ttt = 0
        // setInterval(()=>{
        //     Debug.Clear()
        //     ttt++
        //     var linedPath = path.divideToLine(ttt)
        //     Debug.Line(...linedPath)
        // } , 500)

        // var line = new Line2(new Vector2(100,100) , new Vector2(150,200))
        // new Circle(new Vector2(55,55) , 30 , draw , line)
    */
        DrawModifiablePolyLine(draw) ;
    }
    

    function DrawModifiablePolyLine(draw) {
        let path = new BezierCurveCubic(draw , 2) ;
        let input = document.getElementById("input")
        document.getElementById("copy_polylinepath").addEventListener('click' , (e)=>{
            var copyText = path.path
            input.value = copyText
            console.log(copyText)
            /* Select the text field */
            input.select();

            /* Copy the text inside the text field */
            document.execCommand("copy");
        })
    }

    function Distance(vec1 , vec2) {
        return Math.sqrt(Square(vec1.x - vec2.x)+Square(vec1.y - vec2.y)) ;
    }
    function Square(x) {
        return x*x ;
    }
    function Cube(x) {
        return x*x*x ;
    }
    function findAngle(p0,p1,p2) {
        var b = Math.pow(p1.x-p0.x,2) + Math.pow(p1.y-p0.y,2),
            a = Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2),
            c = Math.pow(p2.x-p0.x,2) + Math.pow(p2.y-p0.y,2);
        return Math.acos( (a+b-c) / Math.sqrt(4*a*b) );
    }

    function Dot(vec1, vec2) {
        var a = vec1.x*vec2.x + vec1.y*vec2.y ;

        return a ;
    }

    function Magnitude(vec) {
        var a = vec.x*vec.x + vec.y*vec.y
        return Math.sqrt(a) ;
    }

    function AngleBetween(vec1 , vec2) {
        return Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x)  ;
    }

    function MouseToAngle(x,y) {
        var angle = Math.atan2(x,-y) ;
        angle = angle * 180/Math.PI ;
        return angle ;
    }

    // Obsolete
    function RotatePoint(origin , point , angle) {
        var cos = Math.cos(angle)
        var sin = Math.sin(angle)

        var dx = point.x - origin.x
        var dy = point.y - origin.y
        // point.x -= origin.x
        // point.y -= origin.y

        point.x = cos*dx + sin*dy
        point.y = cos*dy - sin*dx // some issue with - and +

        point.x += origin.x
        point.y += origin.y
        return point
    }

    function InterpolateBlobSize(start , end , current) {
        end = end - start ;
        current = current - start ;
        var m = 1 / end ;
        current = current * m ;
        return current ;
    }

    // n raise to number
    function RaiseTo(num , raiseTo) {
        var j = 1 ;
        if(raiseTo != 0) {
            for(var i = 0 ; i < raiseTo ; i++) {
                j *= num ;
            }
            return j ;
        }
        else {
            return 1 ;
        }
    }
    // num!
    function Factorial(num) {
        num = num || 0
        // if(num != 0) {
        var j = 1
        while(num != 0) {
            j *= num
            num--
        }
        return j
        // }
        // else
        //     return 1
    }

    // Permuatation
    function Permuatation(n,k) {
        n = n || 0
        k = k || 0

        return Factorial(n)/(Factorial(n-k))
    }

    // Algorithm to find T in any nth bezier curve were 0<=T<=1
    function TimeOnNthBezierCurve(currentPoint ,  ...params) {
        var n = params.length-1
        var dynamicAnonX = "-"+currentPoint[0]
        var dynamicAnonY = "-"+currentPoint[1]
        var j = 0

        while(params.length > 0) {
            var mj = params.length-1
            var mcoeff = [0,0]
            for(var mi = 0 ; mi <= mj; mi++) {
                var msubCoeff = RaiseTo(-1 , mi+mj)/(Factorial(mi)*Factorial(mj-mi)) // circular brackets were imp in denomitor
                var permu = Permuatation(n,mj)
                mcoeff[0] += msubCoeff*params[mi][0]*permu
                mcoeff[1] += msubCoeff*params[mi][1]*permu
            }
            dynamicAnonX += "+RaiseTo(t,"+(n-j)+")*("+mcoeff[0]+")"
            dynamicAnonY += "+RaiseTo(t,"+(n-j)+")*("+mcoeff[1]+")"

            params.pop() // check if first or last to pop
            j++
        }
        var anonymous = (t) => {
            //somethings buggy considering the average as well as just y
            return (eval(dynamicAnonX))// + eval(dynamicAnonY))/2
            // return (eval(dynamicAnonY))
            // return (eval(dynamicAnonX) + eval(dynamicAnonY))/2 // find average for more accuracy
        }
        // console.log(Bisection(anonymous , 0 , 1 , 0.001))
        // console.log(dynamicAnonX)
        return Bisection(anonymous , 0 , 1 , 0.001)
    }


    // Binomial Coefficient nCk (combination)
    function NchooseK(n,k) {
        var d = 0 ; 
        d = Factorial(n)/(Factorial(k)*Factorial(n-k)) ;
        return d ;
    }

    // Length of paramets defines the type of beizer curve
    // Time t and parameters [[x0,y0],....[xn,yn]] returns point on curve . Using linear interpolation from 0 to 1 as time t one can draw curve by consuming points
    function NthBezierCurve(t , ...params) {
        var n = params.length-1
        var pointOnCurve = [0,0]

        for(var i = 0 ; i <= n ; i++) {
            var poly = RaiseTo(t , i)*RaiseTo(1-t , n-i )*NchooseK(n , i)

            pointOnCurve[0] += poly * params[i][0]
            pointOnCurve[1] += poly * params[i][1]

        }
        return pointOnCurve
    }

    // Functions Related to Curves ------------------------------

    // NOTE: Obsolete
    function LinearBeizerCurve(start , end , t) {
        return ((1-t)*start + t*end)
    }


    // NOTE: Obsolete
    // Takes in any specific axis on Curve and gives the time value between [0,1]
    function TimeOnCubicCurve(start , end , startRightNode , endLeftNode , pointOnCurve) {
        var a , b , c , d , anonymous
        // Cubic Polynomial Function with constants a,b,c,d relative to Bezier Curve
        a = -start + 3*startRightNode - 3*endLeftNode + end
        b = 3*start - 6*startRightNode + 3*endLeftNode
        c = -3*start + 3*startRightNode
        d = start - pointOnCurve
        anonymous = (t) => {
            return a*Cube(t) + b*Square(t) + c*t + d
        }
        // Uses Root approximation alogrithm to find unknown t in cubic polynomial function upto 10 decimals
        return Bisection(anonymous , 0 , 2 , 0.0001)
    }

    // TODO: Implement a better root finding algorithm
    // Root Approximation Algorithm
    function Bisection(f , a , b , epsilon) {
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

    function InsertPointOnBezierCurve(point , time , ...params) {
        // console.log(params.length)
        if(params.length > 4)
            throw "Error: Number of points exceeded. Current version supports only Linear , Qudratic & Cubic Bezier Curves."
        else if(params.length < 2)
            throw "Error: Minimum 2 points required."
        
        // Degree elevation to cubic bezier curve
        while(params.length < 4)
            params = ElevateDegreeBezierCurve(Object.assign([] , params))

        // cubically the point at time from right control point of first point and left control point of last node
        var timeOnControlPoint = NthBezierCurve(time , params[1] , params[2])
        // recalculations of control points and inserting them in our curve params array
        // console.log(time)
        params[1] = NthBezierCurve(time , params[0] , params[1])
        params[2] = NthBezierCurve(time , params[2] , params[3])
        var leftControlPoint = NthBezierCurve(time , params[1] , timeOnControlPoint)
        // var leftControlPoint = NthBezierCurve(time  , timeOnControlPoint , params[1])
        var rightControlPoint = NthBezierCurve(time , timeOnControlPoint , params[2])

        // var rightControlPoint = [2*point[0]-leftControlPoint[0] , 2*point[1]-leftControlPoint[1]] // changes curve becoz of approximation root bisection
        params.splice(2,0, leftControlPoint , point , rightControlPoint)

        return params
    }

    // seems to be working
    function ElevateDegreeBezierCurve(params) {
        var n , points , x , y
        n = params.length , points = [] , x = 0 , y = 0 

        for(var i = 1 ; i < n ; i++) { // i.e. i < n+1
            x = (i/(n+1))*params[i-1][0] + (1-i/(n+1))*params[i-1][0]
            y = (i/(n+1))*params[i-1][1] + (1-i/(n+1))*params[i-1][1]
            points.push([x,y])
        }
        points.unshift(params[0])
        points.push(params[n-1])
        // console.log(points)
        return Object.assign([] , points)
    }
})