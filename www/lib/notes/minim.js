define(['wave'],(Wave)=>{
    return class Minim {
        constructor(draw , body) {
            this.minim = new Wave(draw , body , "M 691,471C 730,477 756,410 774,455" , 2000)
        }
    }
})