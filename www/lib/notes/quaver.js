define(['wave'],(Wave)=>{
    return class Quaver {
        constructor(draw , body) {
            this.quaver = new Wave(draw , body , "M 691,471C 730,477 756,410 774,455" , 2000).wave.stroke({width:0  })
            console.log("Quaver is there take care")
        }
    }
})