define(['vector2','wave','particle','wormhole','blower','math','line2','music','gear','vein'] , function(Vector2,Wave,Particle,WormHole,Blower,Math,Line2,Music,Gear,Vein){
    var Body = {}

    Body.Logical = class {
        constructor(draw,body,precision=10,particleMoist=0.1) {
            this.draw = draw
            this.bodyPath = body
            this.precision = precision
            this.moist = particleMoist
            this.particles = [] 
            

            // Border Box
            var body = draw.path(body)//.dmove(100,-280)

            let start = body.pointAt(0) ,
                end = body.pointAt(body.length()) ,
                blowerPoint = new Vector2((start.x+end.x)/2 , (start.y+end.y)/2)

            this.body = body.divideToLine(precision,false)
            body.remove()

            // Other Elements

            var mainGear1 = new Gear(draw , 100 , 17 , -1).move(560,380) ;
            
            var mainGearNode1 = new Gear(draw , 35 , 7 , 1).move(560 , 480) ;
            var mainGearNode2 = new Gear(draw , 50 , 12 , -1).move(504 , 465) ;

            var mainGear2 = new Gear(draw , 80 , 12 , 1).move(550 , 230) ;
            
            var mainGear2Node1 = new Gear(draw , 30 , 5 , -1).move(516 , 270) ;
            var mainGear2Node2 = new Gear(draw , 40 , 8 , 1).move(500 , 304) ;
            var mainGear2Node3 = new Gear(draw , 50 , 10 , -1).move(480 , 350) ;

            // static vessel (denotes the blood veins)
            this.vessel = draw.path('M507.09,677.829c-0.256-4.329-5.062-4.418-14.79-5.009c-10.045-0.61-17.3,4.93-19.97,14.18 c-2.502,8.67-8.33,24-28.3,25c-18.006,0.901-21.407,2.646-29.35,20.82c-7.18,16.43,4.844,23.95,12.07,27.18 c3.699,1.653,15.75,5.75,10.25-10.999c-8.264-25.165,2-18.431,3.25-24.091s3.75-0.16,2,3.09s-8,0.5,0.75,21.25 s28.24,22.15,40,15.7c11.75-6.45,21.9-21.101,24.09-41.62c1.28-12.021,1.147-22.715,0-27.33c-0.967-3.891-6.756-6.806-9.756-8.666 c-1.54-0.96-15.624-9.307-2.333-5.667c4.795,1.314,7.701,2.57,9.388,3.179c4.513,1.627,6.417,4.405,7.112,6.821 c2.146,7.46,0.5,30.803,0.5,30.803s-2.45,88.19-102.39,36.53c-17.17-8.88-36.21-26.67-45.13-42.53 c-4.98-6.979-6.98-15.72-15.23-18.8c-22.92-2-33.58-25.42-23.61-46.2c2.33-4.87-0.38-11.88-5.92-31.31c0,0-9-29.061-9.81-43.65 c-0.82-14.58-3.66-10.51-10.91-22.01s2.83-33.25,16.67-37.25c13.83-4,10.33-12.76,7.33-20.75c-3-8,2.5-17.91,9.88-20.33 c7.37-2.42,7.12-9.22,2.62-19.45c-4.5-10.22,3.26-29.47,22.63-29.97s18.65-12.78,24.37-22.75c17.08-29.76,47.57-31.13,61.75-26.5 c6.87,2.24,19.7,16.22,35.2,12.83c37.05-8.08,32.27,67.59,32.27,67.59L512,686.083c0,0-0.5,2.584-2.833,0.667 S507.236,680.293,507.09,677.829z M507.09,635.67c0,0,3.08-42.87-28.06-42.87c-12.78,0-8.25,31.72-29.03,33.7 c-26.25,2.5-16.3-31.03-46.75-25.25c-6.11,1.16-12.08,1.58-19.58-0.42c-10.18-2.71-14.05,1.82-15.34,6.92 c-1.66,6.58,1.81,16.56,3.94,21.63c4.05,9.601,15.88,28.45-8.64,40.75c-18.3,9.18,4.03,38.28,4.03,38.28s6.4,13.25,13.67,18.26 c7.27,5,18.21,5.57,24.94-6.189c6.73-11.761,15.836-17.717,34.14-16.15c16.59,1.42,24.544-15.209,26.92-22.43 c2.663-8.093,10.76-13.74,25.71-12.66C508,670.33,507,658.55,507,658.55L507.09,635.67z M505.667,563.334 c1.271-15.962,1.423-64.444,1.423-64.444c0-43.51-2.96-44.2-11.34-40.97c-7.84,3.03-16.5,17.08-28,4.23 c-11.5-12.84-9.75-6.9-25.5-5.43c-8,0.75-13.17-1.24-19.75-0.72c-5.34,0.42-9.86,4.71-20.62,8.75 c-14.88,5.58-26.08,2.1-33.55-1.75c-18.05-9.3-21.76-7.28-22.21-1c-0.3,4.29,0.32,9.66-3.27,18.25 c-4.35,10.37,12.83,14.34,16.71,20.31c0.75,1.16-1.01,4.71-6.3,2.37c-27.51-12.18-15.76,3.57-21.6,11.77 c-18.21,25.6,7.1,30.78,15.85,34.42c9.91,4.12,20.82,8.21,24.72,29.32c2.83,15.34,23.77,21.89,52.77,7.31 c24.52-12.33,25.5-3.25,48.75-1.25C500.9,586.84,504.922,572.688,505.667,563.334z M489,452.22c16-15.47,11.25-23.22,5.5-37.72 s-14.64-18.5-37.07-25.17C435,382.67,406.58,379.91,401,397c-1.87,5.73,7,10.35,10.25,18.8c3.25,8.45,6.47,12.28,20.61,15.87 c14.14,3.58,12.89,6.33,27.39,15.08S473,467.69,489,452.22z M408.5,452.75c2.08-2.54,2.34-9.72,2.16-12.97 c-1.28-23.03-18.16-45.53-23.38-29.19c-5.22,16.35-12.53,19.91-26.28,27.03s4.5,17.5,9.33,20.3 C378.66,462.76,398.38,465.12,408.5,452.75z M365.02,601.36c2.94-6.29,4.62-11.62,0.73-26c-4.87-17.98-16.59-18.86-23.67-22.03 c-35.08-15.66-22.41,25.67-21.2,36.34c1.22,10.66,13.45,51.33,13.45,51.33s-0.15,25.48,19.97,20.29 c20.12-5.18,12.52-22.75,9.33-33.78C360.44,616.49,361.78,608.26,365.02,601.36z').fill("#FF4E44")

            var vein__1bbbb = new Vein(draw , 'M 611,591 Q 662,607 672,557 T 657,506' , "#FF4E44" , 6 , 0 , 0.9 , 7 , 0.1 ) ;// ends
            var vein__1bbr = new Vein(draw , 'M 566,565 Q 575,548 583,540 T 609,532 639,501' , "#FF4E44" , 8 , 0 , 1 , 8 , 0.1 ) ; //ends

            var vein__1bbbt = new Vein(draw , 'M 618,594 Q 607,580 603,567 T 606,552' , "#FF4E44" , 7 , 0 , 0.9 , 7 , 0.1 ) ;// ends
            var vein__1bbb = new Vein(draw , 'M 565,562 Q 591,601 611,588' , "#FF4E44" , 6 , 0 , 1 , 7 , 0.13 , [vein__1bbbb , vein__1bbbt] ) ;
            var vein__1bb = new Vein(draw , 'M 506,496 Q 552,584 573,556' , "#FF4E44" , 5 , 0 , 1 , 7 , 0.13 , [vein__1bbb , vein__1bbr] ) ;

            var vein__1aaarrb = new Vein(draw , 'M 673,272 Q 673,309 674,355 T 668,409 615,412' , "#FF4E44" , 7 , 0 , 0.9 , 8 , 0.13) ; // ends
            var vein__1aaarr = new Vein(draw , 'M 597,268 Q 619,266 633,282 T 669,265' , "#FF4E44" , 5 , 0 , 1 , 7 , 0.13 , [vein__1aaarrb]) ; 
            var vein__1aaar = new Vein(draw , 'M 514,273 Q 557,307 591,269' , "#FF4E44" , 6 , 0 , 1 , 7 , 0.13 , [vein__1aaarr]) ; 
            var vein__1aaa = new Vein(draw , 'M 496,314 Q 514,297 505,272' , "#FF4E44" , 5 , 0.1 , 1 , 7 , 0.13 , [vein__1aaar]) ; 
            var vein__1aa = new Vein(draw , 'M 474,367 Q 475,350 487,344 T 493,316' , "#FF4E44" , 5 , 0.1 , 1 , 7 , 0.13 , [vein__1aaa]) ; 
            var vein__1ba = new Vein(draw , 'M 504,496 Q 470,394 479,358' , "#FF4E44" , 5 , 0 , 1 , 9 , 0.16) ; //ends

            var vein__1b = new Vein(draw , 'M 538,418 Q 523,433 535,460 T 502,498' , "#FF4E44" , 5 , 0 , 1 , 7 , 0.13 , [vein__1ba , vein__1bb]) ;
            var vein__1a = new Vein(draw , 'M 536,417 Q 540,374 478,368' , "#FF4E44" , 5 , 0.1 , 1 , 7 , 0.13 , [vein__1aa]) ;

            var vein__1 = new Vein(draw , 'M 605,412 Q 553,431 535,415' , "#FF4E44" , 4 , 0 , 1 , 9 , 0.2 , [vein__1a , vein__1b]) ;
            var vein = new Vein(draw , 'M 673,493 Q 681,413 651,413 T 611,414' , "#FF4E44" , 5 , 0.1 , 0.8 , 10 , 0.13 , [vein__1]) ;

            this.vein = [vein,vein__1,vein__1a,vein__1b,vein__1ba,vein__1aa,vein__1aaa,vein__1aaar,vein__1aaarr,vein__1aaarrb,vein__1bb,vein__1bbb,vein__1bbbt,vein__1bbr,vein__1bbbb] ;

            vein.Fluctuate(true)

            this.blower = new Blower(blowerPoint , 50)

        }
        move(x,y) {
            var body = this.draw.path(this.bodyPath).move(x,y)
            let start = body.pointAt(0) ,
                end = body.pointAt(body.length()) ,
                blowerPoint = new Vector2((start.x+end.x)/2 , (start.y+end.y)/2)

            this.body = body.divideToLine(this.precision,false)
            body.remove()

            

            this.blower.position = blowerPoint
        }
        dmove(x,y) {
            for(var i = 0 ; i < this.vein.length ; i++) {
                this.vein[i].dmove(x,y) ;
            }

        }
        animate() {
            setInterval( function(){this.Update()}.bind(this) , 1000/30)
        }
        Update() {
            const particles = this.particles , lengthOfBodyLines = this.body.length , blower = this.blower
            let i,j,line,collision,normal , direction,reflection,particle,dot,lengthOfParticles = particles.length , distanceToRepulsion , directionToRepulsion

            // Update the particles itself
            for(i = 0 ; i < lengthOfParticles ; i++) {
                particles[i].update()
            }

            // Applying external forces and collisions
            for(i = 0 ; i < lengthOfParticles ; i++) {
                for(j = 0 ; j < lengthOfBodyLines ; j++) {
                    line = this.body[j]

                    collision = line.isIntersectingCircle(particles[i])
                    if(collision.points) {
                        if(collision.points.intersection1.onLine || collision.points.intersection2.onLine) {
                            particle = particles[i]
                            // Take a step back
                            particle.rewind()
                            direction = particle.direction

                            // Reflection = 2*(Normal x Incident)*Normal - Incident
                            normal = Vector2.Cross(line.a , line.b).Normalized()
                            direction.Negate()
                            dot = Vector2.Dot(normal , direction)*2
                            reflection = new Vector2(dot*normal.x - direction.x, dot*normal.y - direction.y).Normalized()
                            particle.direction = reflection

                            // A quick fix to solve penetration of collisions
                            var checkCollisionPersistancy = line.isIntersectingCircle(particle)
                            if(checkCollisionPersistancy.points && (collision.points.intersection1.onLine || collision.points.intersection2.onLine)) {
                                particle.update()
                                particle.update()
                                // particle.update()
                            }
                            break
                        }
                    }
                    else if(collision.pointOnLine.onLine) {
                        // console.log("collided")
                    }
                }
            }
            for(i = 0 ; i < lengthOfParticles ; i++) {
                particle = particles[i]
                direction = particle.direction
                if(blower.inRange(particle)) {
                    directionToRepulsion = Vector2.Direction(particle.position , blower.position)
                    particle.directionScale += 0.001*blower.radius/Vector2.Distance(blower.position , particle.position)*(1-(Vector2.Distance(blower.position , particle.position)/blower.radius))
                    particle.direction = Vector2.Interpolate(direction , directionToRepulsion , particle.directionScale)
                }
            }

            // Finally Redering
            for(i = 0 ; i < lengthOfParticles ; i++) {
                particles[i].render()
            }
        }
        AddParticle(particle) {
            particle.direction.y = Math.randomFloat(0.1,0.2)
            particle.direction.x = -1
            particle.acceleration = 2

            this.vessel.before(particle.particle)

            particle.particle.animate(particle.life*1000 , '<')
            .during(function(pos,morph,ease){
                this.velocity = this.velocity * pos*10 / this.life
                let startEaseAt = 0.8
                if(pos>=startEaseAt) {
                    this.particle.opacity( 1-Math.stretchLine(startEaseAt,1,ease) ) 
                }
            }.bind(particle))
            .after(function(pos,morph,ease){
                this.body.particles.splice(this.body.particles.indexOf(this.particle),1)
                this.particle.particle.remove()
            }.bind({body:this,particle:particle}))

            this.particles.push(particle)

        }
        Add(draw , position , acceleration , direction , size , color , morph) {
            this.particles.push(new Particle(draw,position,this.moist,acceleration,direction).size(size).color(color))
        }
    }

    Body.Musical = class {
        constructor(draw,body,precision=10,particleMoist=0.1) {
            this.draw = draw
            this.bodyPath = body
            this.precision = precision
            this.moist = particleMoist
            this.particles = []
            this.waves = []
            this.bodyToSuctionPoint = null
            
            var body = draw.path(body)//.dmove(100,-280)

            // Find suction point from the opening
            let start = body.pointAt(0) ,
                end = body.pointAt(body.length()) ,
                suctionPoint = new Vector2((start.x+end.x)/2 , (start.y+end.y)/2)

            this.body = body.divideToLine(precision,false)
            body.remove()

            this.group = draw.group()

            // our suction point , radius around the suction point
            this.wormHole = new WormHole(draw , suctionPoint , 200 , 90)

            // define waves within our body and initialize Wave classes
            this.music = new Music(draw , this)
            this.music.move(0,0)




            // var p1
            // p1 = "M 100 350 C 100 300 150 250 200 250 C 400 250 400 450 450 350 C 500 250 550 150 600 200 C 650 250 750 100 750 200"

            // this.waves.push(new Wave(draw,this,p1,2000))

            // for(var i = 0 ; i<this.waves.length ; i++)
            //     this.waves[i].PrebakeParticle(draw,10)
            
        }

        move(x,y) {
            var body = this.draw.path(this.bodyPath).move(x,y)

            // Find suction point from the opening
            let start = body.pointAt(0) ,
                end = body.pointAt(body.length()) ,
                suctionPoint = new Vector2((start.x+end.x)/2 , (start.y+end.y)/2)

            this.body = body.divideToLine(this.precision,false)
            body.remove()

            this.wormHole.position = suctionPoint

            // // TODO: move waves aswell
            // const waves = this.waves , wavesLength = waves.length
            // let i = 0

            // for(i = 0 ; i < wavesLength ; i++) {
            //     let wave = waves[i]
            //     wave.move(x-600,y+150)
            // }
        }


        // test_PrebakeParticles(draw) {
        //     for(var i = 0 ; i<this.waves.length ; i++)
        //         this.waves[i].PrebakeParticle(draw,10)
        // }
        // This is going to be our logical body were we will bombard the particles from suction point


        AttachBodyToSuctionPoint(body) {
            this.bodyToSuctionPoint = body
            return this
        }
        animate() {
            let draw = this.draw
            setInterval( function(){this.Update()}.bind(this) , 1000/30)
            // Start all waves
            this.music.Start(draw)
            // this.waves[0].Start(draw)
        }
        Update() {
            let i,j,line,collision,normal,direction,reflection,particle,dot,directionToSuction,distanceToSuction,distanceToSuctionPercentage
            const particles = this.particles , lengthOfBodyLines = this.body.length , wormHole = this.wormHole
            let lengthOfParticles = particles.length

            // Update the particles itself
            for(i = 0 ; i < lengthOfParticles ; i++) {
                particles[i].update()
            }


            // Applying external forces and collisions
            for(i = 0 ; i < lengthOfParticles ; i++) {
                for(j = 0 ; j < lengthOfBodyLines ; j++) {
                    line = this.body[j]
                    collision = line.isIntersectingCircle(particles[i])
                    if(collision.points) {
                        if(collision.points.intersection1.onLine || collision.points.intersection2.onLine) {
                            particle = particles[i]
                            // Take a step back
                            particle.rewind()
                            direction = particle.direction

                            // Reflection = 2*(Normal x Incident)*Normal - Incident
                            normal = Vector2.Cross(line.a , line.b).Normalized()
                            direction.Negate()
                            dot = Vector2.Dot(normal , direction)*2
                            reflection = new Vector2(dot*normal.x - direction.x, dot*normal.y - direction.y).Normalized()
                            particle.direction = reflection

                            // A quick fix to solve penetration of collisions
                            var checkCollisionPersistancy = line.isIntersectingCircle(particle)
                            if(checkCollisionPersistancy.points && (collision.points.intersection1.onLine || collision.points.intersection2.onLine)) {
                                // TODO: Shift the particle reflectively inside the boundaries
                                particle.update()
                                particle.update()
                                // particle.update()
                            }
                            break
                        }
                    }
                    else if(collision.pointOnLine.onLine) {
                        // console.log("collided")
                    }
                }
            }

            // Applying wormhole suctions force
            for(i = 0 ; i < lengthOfParticles ; i++) {
                particle = particles[i]
                direction = particle.direction

                directionToSuction = Vector2.Direction(wormHole.position , particle.position)
                distanceToSuction = Vector2.Distance(wormHole.position , particle.position)

                // TODO: Interpolate the suction value with curve
                if(wormHole.inRange(particle)) {
                    particle.directionScale += 0.00001*wormHole.radius/Vector2.Distance(wormHole.position , particle.position)*(1-(Vector2.Distance(wormHole.position , particle.position)/wormHole.radius))
                    particle.direction = Vector2.Interpolate(direction , directionToSuction , particle.directionScale)

                    // Check the angle of cone made by a the wormhole
                    if(wormHole.insideCone(particle)) {
                        distanceToSuctionPercentage = distanceToSuction*100/wormHole.radius
                        if(distanceToSuctionPercentage <= 20) {
                            particle.direction = directionToSuction
                            particle.acceleration += 0.1
                        }
                        if(distanceToSuctionPercentage <= 3) {
                            this.particles.splice(i , 1)
                            this.bodyToSuctionPoint.AddParticle(particle)
                            i--
                            lengthOfParticles--
                        }
                    }

                }
                else {
                    // particle.directionScale = 0
                }
            }

            // Finally Redering
            for(i = 0 ; i < lengthOfParticles ; i++) {
                particles[i].render()
            }
        }
        Add(draw , position , acceleration , direction , size , color , life , morph) {
            let particle = new Particle(draw,position,this.moist,acceleration,direction,life).size(size).color(color)
            // particle.group.before(this.group)
            this.group.after(particle.group)
            this.particles.push(particle)
        }
    }

    return Body
})