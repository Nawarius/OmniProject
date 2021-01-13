class User{
    constructor(id){
        this.x = 5
        this.y = 3
        this.z = 7
        this.id = id
    }
    getId(){
        return this.id
    }
    setCoords(x, y, z){
        this.x = x
        this.y = y
        this.z = z
    }
}

exports.User = User