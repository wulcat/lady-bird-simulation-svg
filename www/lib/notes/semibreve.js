define(['wave'],(Wave)=>{
    return class Semibreve {
        constructor(draw , body) {
            this.semibreve = new Wave(draw , body , "M 693,456C 736,458 688,400 749,372" , 2000)
        }
    }
})