const colyseus = require("colyseus")
const schema = require('@colyseus/schema')
const http = require("http")
const express = require("express")
const {Antenna} = require("./classes/Antenna")
const {State} = require("./classes/State")
const {Player} = require("./classes/Player")

const port = process.env.port || 4000

const app = express()
app.use(express.json())


class MyRoom extends colyseus.Room {
    
    async onCreate (options) {
        this.setState(new State())
    }

    async onJoin (client, options) {
        this.state.players.set(client.sessionId, new Player(client.sessionId))
        this.state.antenna.set(client.sessionId, new Antenna())

        const myCoords = this.state.players.get(client.sessionId)
        const antenna = this.state.antenna.get(client.sessionId)

        this.broadcast('changeAntennaCoords', {x: antenna.x, y: antenna.y, z: antenna.z})

        const players = []
        this.state.players.forEach((value, key, map)=>{
            if(key !== client.sessionId){
                const obj = {
                    id:key,
                    x:value.x,
                    y:value.y,
                    z:value.z
                }
                players.push(obj)
            }
        })
        
        client.send('getAllUsersCoords', players)        
        this.broadcast('user joined', {coords: myCoords, id:client.sessionId}, {except:client})

        this.onMessage('changeAntennaCoords', (client, data)=>{
            const antenna = this.state.antenna.get(client.sessionId)
            antenna.x += data.x
            antenna.y += data.y
            antenna.z += data.z
            this.broadcast('changeAntennaCoords', {x: antenna.x, y: antenna.y, z: antenna.z})
        })

        this.onMessage('my new coords', (client, data)=>{
            myCoords.x = data.position._x,
            myCoords.y = data.position._y,
            myCoords.z = data.position._z
            this.broadcast('other user coords', {coords: myCoords, id:client.sessionId}, {except:client})
        })
    }

    async onLeave (client, consented) {
        this.broadcast('delete mesh', client.sessionId)
        this.state.players.delete(client.sessionId)
    }

    async onDispose () {

    }
}

const gameServer = new colyseus.Server({
  server: http.createServer(app)
})
gameServer.define('mainGame', MyRoom)

gameServer.listen(port)

console.log(`Listening on port ${port}` )