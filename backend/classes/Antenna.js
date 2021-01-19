const schema = require('@colyseus/schema')

class Antenna extends schema.Schema{
    constructor(){
        super()
        if(Antenna.exist){
            return Antenna.instance
        }
        Antenna.instance = this
        Antenna.exist = true
        this.x = 0
        this.y = 3.5
        this.z = 0 
    }
}

schema.defineTypes(Antenna,{
    x: "number",
    y: "number",
    z: "number"
})

exports.Antenna = Antenna