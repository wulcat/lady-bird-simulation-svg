
define(['math','vector2'] , (Math,Vector2)=>{
    return class Wave {
        constructor(draw , body , path , speed) {
            this.body = body
            this.speed = speed

            // masking technique for inverted clipping
            // var waveOverlap = draw.path("M 153,292 Q 240,386 317,315 T 532,309 593,494 428,527 312,537").fill('none').stroke({stroke:1,color:'white'}) ;
            // var rectOverlap = draw.rect(stretch*2,10).fill('black')//.move(100,100) ;
            // var mask = draw.mask().add(waveOverlap).add(rectOverlap) ;
    
            this.wave = draw.path(path).fill('none').stroke({width:5,color:'red',linecap:'round'}).convertToCubicPath() //.maskWith(mask) ;

            this.originalPath = JSON.parse(JSON.stringify(this.wave.array().value)) 
        }
        move(x,y) {
            this.wave.move(x,y)
        }
        // // number of particles to prebake
        // PrebakeParticle(draw,number=10) {
        //     for(var i = 0 ; i < number ; i++) {
        //         var length , acceleration , pos , direction , cpos
        
        //         length = this.wave.length()
        //         acceleration = length/this.speed
        //         pos = this.wave.pointAt(length)
        //         cpos = this.wave.pointAt(length-5)
        //         direction = new Vector2(pos.x-cpos.x+Math.randomFloat(-1,1) , pos.y-cpos.y+Math.randomFloat(-1,1)).Normalized()
                
        //         this.body.Add(draw , pos , acceleration , direction , 10 , "green" , 10)

        //         var randomUpdate = Math.randomInt(1,100)
        //         for(var j = 0 ; j < randomUpdate ; j++) {
        //             this.body.Update()
        //         }
        //     }
        //     return this
        // }

        Start(draw) {
            var duringWaveAnimation = function(pos,morph,ease){
                let wave , totalWaveLength , startEase , endEase , maxAmplitude , wavePole , maxWaveSize , totalAmplitude , totalWaveSize , controlPoint , point , nextPoint , pathArray , curveIndex , nextCurveIndex
                // In order get correct points at length on original curve
                wave = this.wave
                wave.plot(this.originalPath)
    
                totalWaveLength = wave.length()*ease
                startEase = 0.2
    
                endEase = 0.95
                maxAmplitude = 20
    
                wavePole = 0 // angle of control nodes of point c (middle point)
                maxWaveSize = 50
    
                // amplitude of control point
                if(ease > endEase) {
                    var interpolation = (1 - Math.interpolate.Value(endEase,1,ease))
                    totalAmplitude = maxAmplitude * interpolation
                    totalWaveSize = maxWaveSize * interpolation
                }
                else if(ease < startEase) {
                    var interpolation = Math.interpolate.Value(0,startEase,ease) 
                    totalAmplitude = maxAmplitude * interpolation
                    totalWaveSize = maxWaveSize * interpolation
                }
                else {
                    totalAmplitude = maxAmplitude
                    totalWaveSize = maxWaveSize
                }
    
                controlPoint = {x:wavePole,y:totalAmplitude}
    
                point = [wave.pointAt(totalWaveLength-totalWaveSize/2).x , wave.pointAt(totalWaveLength-totalWaveSize/2).y]
                nextPoint = [wave.pointAt(totalWaveLength+totalWaveSize/2).x , wave.pointAt(totalWaveLength+totalWaveSize/2).y]
                pathArray = wave.deepArrayPath(true)
    
                curveIndex = 1
                nextCurveIndex = 0

                for( curveIndex = 1 ; curveIndex < pathArray.length ; curveIndex++) {
                    var lastElementOfPrevious = pathArray[curveIndex-1][pathArray[curveIndex-1].length-1]
    
                    var currentTimeOnCurve = Math.bezier.TimeOnNthBezierCurve(point , lastElementOfPrevious , ...pathArray[curveIndex])
                    
                    // once we find the curve in which the point lies we insert the point and go for inserting the next point
                    if(currentTimeOnCurve >= 0 && currentTimeOnCurve < 1 ){
                        var cubicPoint = Math.bezier.InsertPointOnBezierCurve(point , currentTimeOnCurve , lastElementOfPrevious , ...pathArray[curveIndex])
            
                        for(nextCurveIndex = curveIndex ; nextCurveIndex < pathArray.length ; nextCurveIndex++) {
                            lastElementOfPrevious = pathArray[nextCurveIndex-1][pathArray[nextCurveIndex-1].length-1]
                            var nextTimeOnCurve = Math.bezier.TimeOnNthBezierCurve(nextPoint , lastElementOfPrevious , ...pathArray[nextCurveIndex])
                            // now we insert both points collectively
                            if(nextTimeOnCurve >= 0 && nextTimeOnCurve < 1) {
                                var nextCubicPoint
                                if(nextCurveIndex != curveIndex)
                                    nextCubicPoint = Math.bezier.InsertPointOnBezierCurve(nextPoint , nextTimeOnCurve , pathArray[nextCurveIndex-1][pathArray[nextCurveIndex-1].length-1] , ...pathArray[nextCurveIndex])
                                else
                                    nextCubicPoint = Math.bezier.InsertPointOnBezierCurve(nextPoint , nextTimeOnCurve , cubicPoint[3] , cubicPoint[4] , cubicPoint[5] , cubicPoint[6])
    
                                pathArray[nextCurveIndex][0] = nextCubicPoint[4]
                                pathArray[nextCurveIndex][1] = nextCubicPoint[5]
    
                                // CALCULATION OF CURVE
                                var a = new Vector2(point[0] , point[1]) //start point
                                var eDash = new Vector2(nextPoint[0] , nextPoint[1]) //end point
                                var distance = Vector2.Distance(a,eDash)
                                var curveAngle = Vector2.AngleBetween(a,eDash)
    
    
                                var e = new Vector2(a.x+distance , a.y)
                                var c = new Vector2((a.x+e.x)/2 , (a.y+e.y)/2) // center point
    
                                var b = new Vector2((e.x-a.x)*0.2+a.x , c.y-totalAmplitude + (a.y-e.y)/2) // 20% from a point
                                var d = new Vector2((e.x-a.x)*0.8+a.x , c.y+totalAmplitude - (a.y-e.y)/2) // 80% from a point
                                
                                var al = new Vector2(a.x-distance*0.1 , a.y) // 10% behind the a point
                                var ar = new Vector2(2*a.x-al.x , 2*a.y-al.y) // reflection of al
    
                                var bl = new Vector2(ar.x , ar.y) // same node ar
                                var br = new Vector2(2*b.x-bl.x , 2*b.y-bl.y) // reflection of b left node
    
                                
                                var cl = new Vector2(Math.clamp(br.x , c.x , -controlPoint.x+c.x) , 2*c.y - Math.max(controlPoint.y+c.y , c.y)) // limitations to inputs for handling center axis contorl points
                                var cr = new Vector2(2*c.x - cl.x , 2*c.y - cl.y) // reflection of c left node
    
                                var el = new Vector2(e.x-distance*0.1 , e.y) // 10% behind the e point
                                var er = new Vector2(2*e.x-el.x , 2*e.y-el.y) // reflection of el
    
                                var dr = new Vector2(el.x , el.y) // same node el
                                var dl = new Vector2(2*d.x-dr.x , 2*d.y-dr.y) // reflection of dr
    
                                
                                e.RotateAround(a,curveAngle)
                                el.RotateAround(a,curveAngle)
                                er.RotateAround(a,curveAngle)
    
                                ar.RotateAround(a,curveAngle)
                                al.RotateAround(a,curveAngle)
    
                                bl.RotateAround(a,curveAngle)

                                b.RotateAround(a,curveAngle)
                                br.RotateAround(a,curveAngle)
    
                                cr.RotateAround(a,curveAngle)
                                c.RotateAround(a,curveAngle)
                                cl.RotateAround(a,curveAngle)
    
                                d.RotateAround(a,curveAngle)
                                dl.RotateAround(a,curveAngle)
                                dr.RotateAround(a,curveAngle)
    
                                // Assigning and inserting new points to our pathArray
                                nextCubicPoint[1] = cubicPoint[3]
                                nextCubicPoint[2] = nextCubicPoint[3]
                                pathArray.splice(curveIndex , nextCurveIndex-curveIndex , 
                                    [cubicPoint[1] , cubicPoint[2] , cubicPoint[3]] 
                                    /**, calculate the points and insert here */ ,
    
                                    // removed ar.x,ar.y and convereted to qudratic cruve
                                    [[bl.x,bl.y] , [b.x,b.y]] ,
                                    [[br.x,br.y] , [cl.x,cl.y] , [c.x,c.y]] ,
                                    [[cr.x,cr.y] , [dl.x,dl.y] , [d.x,d.y]] ,
                                    // [nextCubicPoint[1] , nextCubicPoint[2] , nextCubicPoint[3]]
                                    // [[dr.x,dr.y] , [el.x,el.y] , nextCubicPoint[3]]
                                    [[el.x,el.y] , [e.x,e.y]]
                                    // Replace the nextCubicPoint[3] by e and create add a static point for a little ahead to maintain curve
                                )
    
                                break
                            }
                        }
                        break
                    }
                }    
                wave.applyDeepArrayPath(pathArray)
            }.bind(this)


            var ultimateLoop = function() {
                var wave = this.wave
                var speed = this.speed 
                wave.animate(speed , '-').during(duringWaveAnimation).after(function(){
                    var length , acceleration , pos , direction , cpos
        
                    length = this.wave.length()
                    acceleration = length/this.speed
                    pos = this.wave.pointAt(length)
                    cpos = this.wave.pointAt(length-5)
                    direction = new Vector2(pos.x-cpos.x+Math.randomFloat(-1,1) , pos.y-cpos.y+Math.randomFloat(-1,1)).Normalized()
                    
                    this.body.Add(draw , pos , acceleration , direction , 10 , "yellow",15)

    
                    ultimateLoop()
                }.bind(this))
            }.bind(this)
            ultimateLoop()
        }
    }
})