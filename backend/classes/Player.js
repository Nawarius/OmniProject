const schema = require('@colyseus/schema')

class Player extends schema.Schema {
    constructor(id) {
        super()
        this.x = 5
        this.y = 3
        this.z = 7
    }
}
schema.defineTypes(Player, {
    x: "number",
    y: "number",
    z: "number"
})

exports.Player = Player