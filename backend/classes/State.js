const schema = require('@colyseus/schema')
const {Antenna} = require("./Antenna")
const {Player} = require("./Player")

class State extends schema.Schema {
    constructor() {
        super();
        this.players = new schema.MapSchema(),
        this.antenna = new schema.MapSchema()
    }
}

schema.defineTypes(State, {
    players: { map: Player },
    antenna: { map: Antenna }
});

exports.State = State