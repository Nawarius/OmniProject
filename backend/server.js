const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const {AntennaCoords} = require('./classes/AntennaCoords')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {cors:{origin:'*'}})

const PORT = process.env.PORT || 4000

const Coords = new AntennaCoords()


io.on('connection', socket => {   
    socket.on('join game', () => {
        console.log(socket.id)
        io.emit('new antennaRotation', Coords.getRotationCoords())
    })
    socket.on('new coords', coords => {
        Coords.setNewRotationCoords(coords)
        io.emit('new antennaRotation', Coords.getRotationCoords())
    })
    socket.on('rotateY', bool => {
        io.emit('rotationAccessY', bool)
    })
    socket.on('rotateXUp', bool => {
        io.emit('rotationAccessXUp', bool)
    })
    socket.on('rotateXDown', bool => {
        io.emit('rotationAccessXDown', bool)
    })
})

server.listen(PORT, ()=>console.log(`Server has been initialize ${PORT}`))