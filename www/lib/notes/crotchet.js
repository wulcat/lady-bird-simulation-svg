define(['wave'],(Wave)=>{
    return class Crotchet {
        constructor(draw , body) {
            this.crotchet = new Wave(draw , body , "M 695,486C 715,480 725,513 756,521C 787,523 798,500 799,485" , 2000)
        }
    }
})