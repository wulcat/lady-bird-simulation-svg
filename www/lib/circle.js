define(['vector2'] , (Vector2)=>{
    return class {
        constructor(position=new Vector2(), radius=1 , draw , line) {
            this.position = position
            this.radius = radius

            this.circle = draw.circle(position.x,position.y).size(radius*2)
        }
        
    }
})