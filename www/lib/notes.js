define(["notes/crotchet" , "notes/semibreve" , "notes/minim" , "notes/quaver"],(Crotchet , Semibreve , Minim , Quaver)=>{
    return class Notes {
        constructor(draw , body) {
            this.crotchet = new Crotchet(draw , body)
            this.semibreve = new Semibreve(draw , body)
            this.minim = new Minim(draw , body)
            this.quaver = new Quaver(draw , body)
        }
    }
})