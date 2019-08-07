define(['wing' , 'repository'] , (Wing , Repository)=>{
    return class Chip {
        constructor(draw) {
            this.draw = draw ;
            this.leftWing = new Wing(draw , "M 701,282 Q 712,282 726,284 T 742,297 737,309 721,306 701,320").opacity(0) ;
            this.rightWing = new Wing(draw , "M 701,282 Q 712,282 726,284 T 742,297 737,309 721,306 701,320").opacity(0) ;

            this.rect = draw.path('M524.271,498c0,1.657-1.343,3-3,3h-18.543c-1.657,0-3-1.343-3-3v-39.333 c0-1.657,1.343-4,3-4h18.543c1.657,0,3,1.343,3,3V498z').fill("#FFFFFF") ;
            this.rightNode = draw.group() ;
            this.leftNode = draw.group() ;

            // this.leftRepoistories = []
            
            // this.leftRepoistories.push(new Repository(draw , "Repo Name" , 50 , 52 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(143,435)) ;

            // var m = draw.path().M(634,320).L(598,332).L(534,332).L(480,375).fill("none").stroke({color:"white"}) ;
            // var m1 = draw.path().M(480,375).L(415,428).L(299,428).L(256,461).L(172,461).fill("none").stroke({color:"white"}) ;
            // var m1 = draw.path().M(480,375).L(50,50).fill("none").stroke({color:"white"}) ;
            // M 634,320 L598,332 L534,332 L480,375 L299,428 L256,461 L172,461 L706,-2 L806,-2 L906,-2
        }

        move(x,y) {
            this.leftWing.move(x-215+174,y-94+97.5) ;
            this.rightWing.move(x-215+239,y-94+97.5) ;
            this.leftWing.Outline.flip("x") ;// it is necessary to move before flipping

            this.rect.move(x,y) ;
            this.rightNode.move(x-500,y-455) ;
            this.leftNode.move(x-500,y-455) ;
        }
        animateLeftRepositories(draw , lineProperties) {
            var path , endPoint ;
            // Left Node
            var path = draw.path().M(507.207,463.625).L(492.25,463.625).stroke(lineProperties) ;
            var endPoint = draw.circle(0).fill("white").center(492.25,463.625) ;
            path.drawAnimated().after(function() {
                this.animate(250).radius(2.1) ;
            }.bind(endPoint)) ;
            this.leftNode.add(path) ;
            this.leftNode.add(endPoint) ;

            var path = draw.path().M(507.207,492.042).L(492.25,492.042).stroke(lineProperties) ;
            var endPoint = draw.circle(0).fill("white").center(492.25,492.042) ;
            path.drawAnimated().after(function() {
                this.animate(250).radius(2.1) ;
            }.bind(endPoint)) ;
            this.leftNode.add(path) ;
            this.leftNode.add(endPoint) ;

            lineProperties.width = 1.2 ;
            var path = draw.path().M(512.603,485.375).L(480.854,485.375).stroke(lineProperties).dmove(-1,1.5) ;
            var endPoint = draw.circle(0).fill("white").center(480.854,485.375).dmove(-1,1.5) ;
            path.drawAnimated().after(function() {
                this.animate(100).radius(1.75) ;
            }.bind(endPoint)) ;
            this.leftNode.add(path) ;
            this.leftNode.add(endPoint) ;

            var path = draw.path().M(512.603,470.292).L(480.854,470.292).stroke(lineProperties).dmove(-1,-1.5) ;
            var endPoint = draw.circle(0).fill("white").center(480.854,470.292).dmove(-1,-1.5) ;
            path.drawAnimated().after(function() {
                this.animate(100).radius(1.75) ;
            }.bind(endPoint)) ;
            this.leftNode.add(path) ;
            this.leftNode.add(endPoint) ;

            lineProperties.width = 0.9;
            var path = draw.path().M(515.75,480.875).L(483.707,480.875).stroke(lineProperties).dmove(-16,1) ;
            var endPoint = draw.circle(0).fill("white").center(483.707,480.875).dmove(-16,1) ;
            path.drawAnimated().after(function() {
                this.animate(100).radius(1.5).after(function(){
                    var stroke = {color:"white",width:0.9};
                    var p = draw.path().M(634,320.45).L(598,332).L(534,332).L(480,375).fill("none").stroke(stroke) ;
                    p.drawAnimated({duration:2000}).after(function(){
                        var p1 = draw.path().M(480,375).L(415,428).L(299,428).L(256,461).L(172,461).fill("none").stroke(stroke) ;
                        p1.drawAnimated({duration:2000}).after(function(){
                            new Repository(draw , "Repo Name" , 50 , 52 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(172,461).show(250) ;
                        }.bind(this));
                        var p2 = draw.path().M(480,375).L(465,365).L(430,365).fill("none").stroke(stroke) ;
                        p2.drawAnimated().after(function() {
                            var p1 = draw.path().M(430,365).L(390,365).fill("none").stroke(stroke) ;
                            p1.drawAnimated() ;
                            var p2 = draw.path().M(430,365).L(400,390).L(335,390).fill("none").stroke(stroke) ;
                            p2.drawAnimated().after(function(){
                                new Repository(draw , "Repo Name" , 40 , 42 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(335,390).show(250) ;
                            });
                        }) ;
                    }.bind(this)) ;
                }.bind(this)) ;
            }.bind(endPoint,this)) ;
            this.leftNode.add(path) ;
            this.leftNode.add(endPoint) ;

            var path = draw.path().M(515.75,474.792).L(483.707,474.792).stroke(lineProperties).dmove(-16,-1) ;
            var endPoint = draw.circle(0).fill("white").center(483.707,474.792).dmove(-16,-1) ;
            path.drawAnimated().after(function() {
                this.animate(100).radius(1.5) ;
            }.bind(endPoint)) ;
            this.leftNode.add(path) ;
            this.leftNode.add(endPoint) ;

            lineProperties.width = 0.7 ;
            var path = draw.path().M(506.276,477.833).L(477.875,477.833).stroke(lineProperties).dmove(7,0) ;
            var endPoint = draw.circle(0).fill("white").center(477.875,477.833).dmove(7,0) ;
            path.drawAnimated().after(function() {
                this.animate(100).radius(1.5) ;
            }.bind(endPoint)) ;
            this.leftNode.add(path) ;
            this.leftNode.add(endPoint) ;
        }
        animateRightRepositories(draw , lineProperties) {
            let path , endPoint
            // Right Node
            path = draw.path().M(516.646,492.042).L(531.604,492.042).stroke(lineProperties)
            endPoint = draw.circle(0).fill("white").center(531.604,492.042)

            path.drawAnimated().after(function(){
                this.animate(250).radius(2.1)
            }.bind(endPoint))
            this.rightNode.add(path)
            this.rightNode.add(endPoint)

            path = draw.path().M(516.646,463.625).L(531.604,463.625).stroke(lineProperties)
            endPoint = draw.circle(0).fill("white").center(531.604,463.625)

            path.drawAnimated().after(function(){
                this.animate(250).radius(2.1)
            }.bind(endPoint))
            this.rightNode.add(path)
            this.rightNode.add(endPoint)

            lineProperties.width = 1.2
            path = draw.path().M(511.25,485.375).L(543,485.375).stroke(lineProperties).dmove(1,1.5)
            endPoint = draw.circle(0).fill("white").center(543,485.375).dmove(1,1.5)

            path.drawAnimated().after(function(){
                this.animate(250).radius(1.75)
            }.bind(endPoint))
            this.rightNode.add(path)
            this.rightNode.add(endPoint)

            path = draw.path().M(511.25,470.292).L(543,470.292).stroke(lineProperties).dmove(1,-1.5)
            endPoint = draw.circle(0).fill("white").center(543,470.292).dmove(1,-1.5)

            path.drawAnimated().after(function(){
                this.animate(250).radius(1.75)
            }.bind(endPoint))
            this.rightNode.add(path)
            this.rightNode.add(endPoint)

            lineProperties.width = 0.9

            path = draw.path().M(508.104,480.875).L(542.979,480.875).stroke(lineProperties).dmove(16,1)
            endPoint = draw.circle(0).fill("white").center(542.979,480.875).dmove(16,1)

            path.drawAnimated().after(function(){
                this.animate(250).radius(1.5).after(function(){
                    var stroke = {color:"white",width:0.9}
                    let p = draw.path().M(710 , 326).C({x: 791, y: 326}, {x: 877, y: 373}, {x: 920, y: 407}).stroke(stroke).fill("none")
                    p.drawAnimated({duration:2000}).after(function(){
                        var stroke = {color:"white",width:0.9}
                        let p1 = draw.path().M(920 , 407).C({x: 1004, y: 476}, {x: 998, y: 547}, {x: 1104, y: 513}).stroke(stroke).fill("none")
                        p1.drawAnimated({duration:2000}).after(function(){
                            new Repository(draw , "Repo Name" , 50 , 52 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(1104,513).show(250) ;
                        }.bind(this))

                        let p2 = draw.path().M(920 , 407).C({x: 983, y: 458}, {x: 1064, y: 476}, {x: 1066, y: 429}).stroke(stroke).fill("none")
                        p2.drawAnimated({duration:2000}).after(function(){
                            new Repository(draw , "Repo Name" , 30 , 32 , 10 , 250 , "http://wulcat.com/image/38941990_1639432982852632_333101754918895616_n.jpg").move(1066,429).show(250) ;
                        }.bind(this))

                    }.bind(this))
                }.bind(this))
            }.bind(endPoint))
            this.rightNode.add(path)
            this.rightNode.add(endPoint)

            path = draw.path().M(508.104,474.792).L(542.979,474.792).stroke(lineProperties).dmove(16,-1)
            endPoint = draw.circle(0).fill("white").center(542.979,474.792).dmove(16,-1)

            path.drawAnimated().after(function(){
                this.animate(250).radius(1.5)
            }.bind(endPoint))
            this.rightNode.add(path)
            this.rightNode.add(endPoint)

            lineProperties.width = 0.7 ;
            // this.rightNode.add(draw.line(545.979,477.833,517.577,477.833).stroke(lineProperties).dmove(-7,0)) ;
            path = draw.path().M(517.577,477.833).L(545.979,477.833).stroke(lineProperties).dmove(-7,0)
            endPoint = draw.circle(0).fill("white").center(545.979,477.833).dmove(-7,0)

            path.drawAnimated().after(function(){
                this.animate(250).radius(1.5)
            }.bind(endPoint))
            
            this.rightNode.add(path)
            this.rightNode.add(endPoint)

        }
        animate() {
            var draw = this.draw ;
            this.leftWing.Open(900 , "M 689,298 Q 912,297 1144,344 T 1281,493 1071,600 882,483 689,338")
            this.rightWing.Open(900 , "M 689,298 Q 912,297 1144,344 T 1281,493 1071,600 882,483 689,338") ;

            // Left Wing Repo's
            var leftLineProp = {color:"#FFFFFF" , width:1.8 , linecap:"round" , miterlimit:10} ;
            this.animateLeftRepositories(draw , leftLineProp)
            // Right Wing Repo's
            var rightLineProp = {color:"#FFFFFF" , width:1.8 , linecap:"round" , miterlimit:10} ;
            this.animateRightRepositories(draw , rightLineProp)
        }
    }
})