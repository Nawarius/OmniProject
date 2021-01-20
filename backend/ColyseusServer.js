require('dotenv').config()
const colyseus = require("colyseus")
const schema = require('@colyseus/schema')
const http = require("http")
//const cors = require('cors')
const express = require("express")
const {Antenna} = require("./classes/Antenna")
const {State} = require("./classes/State")
const {Player} = require("./classes/Player")

const AccessToken = require('twilio').jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

const twillioUsers = []

const ACCOUNT_SID = 'AC37352ef0dd560f1759ba5e677e24f018'
const API_KEY_SID = 'SK994286a0e377ce7b8c3232de743f76df'
const API_KEY_SECRET = 'wRmkPH6DxDVLZ6moFwl30EjNQ0KJNgrP'



const port = process.env.port || 4000

const app = express()
//app.use(cors())
app.use(express.json())

class MyRoom extends colyseus.Room {
    
    async onCreate (options) {
        this.setState(new State())
    }

    async onJoin (client, options) {
        this.state.players.set(client.sessionId, new Player(client.sessionId))
        this.state.antenna.set(client.sessionId, new Antenna())
        //Twillio
        const accessToken = new AccessToken(
            ACCOUNT_SID,
            API_KEY_SID,
            API_KEY_SECRET
        )

        twillioUsers.push(client.sessionId)

        accessToken.identity = client.sessionId
        const grant = new VideoGrant()
        grant.room = 'Test room'
        accessToken.addGrant(grant)
        
        const jwt = accessToken.toJwt()
        this.broadcast('accessToken', jwt)
        //Twillio end
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