class AntennaCoords{
    constructor(){
        if(AntennaCoords.exist){
            return AntennaCoords.instance
        }
        AntennaCoords.instance = this
        AntennaCoords.exist = true
        this.antennaRotationCoords = {
            x:0,
            y:3.5,
            z:0
        } 
    }
    getRotationCoords(){
        return this.antennaRotationCoords
    }
    setNewRotationCoords({x,y,z}){
        this.getRotationCoords().x = x
        this.getRotationCoords().y = y
        this.getRotationCoords().z = z
    }
    
}

exports.AntennaCoords = AntennaCoords