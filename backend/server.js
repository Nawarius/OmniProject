require('dotenv').config()
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const app = express()
const {AntennaCoords} = require('./classes/AntennaCoords')

const server = http.createServer(app)
const io = socketio(server, {cors:{origin:'*'}})

const PORT = process.env.PORT || 4000

const Coords = new AntennaCoords()

const users = []

io.on('connection', socket => {   
    socket.on('join game', () => {
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
    //WebRTC
    socket.on('join audio',()=>{
        users.push(socket.id)
        const otherUser = users.find(id => id !== socket.id)
        if(otherUser){
            console.log('My ID', socket.id)
            console.log('Other ID', otherUser)
            socket.emit('other user', otherUser)
            socket.to(otherUser).emit('user joined', socket.id)
        }
    })
    socket.on('offer', payload => {
        console.log('OFFER')
        console.log(payload.target)
        console.log(socket.id)
        io.to(payload.target).emit('offer', payload)
    })
    socket.on('answer', payload => {
        console.log('ANSWER')
        console.log(payload.target)
        console.log(socket.id)
        io.to(payload.target).emit('answer', payload)
    })
    socket.on('ice-candidate', incoming => {
        console.log('ICE-CANDIDATE')
        console.log(incoming.target)
        console.log(socket.id)
        io.to(incoming.target).emit('ice-candidate', incoming.candidate)
    })
    socket.on('disconnect', ()=>{
        const index = users.findIndex(id=>id === socket.id)
        users.splice(index, 1)
    })
})
if(process.env.PROD){
    app.use(express.static(path.join(__dirname, './client/build')))
    app.get('*', (req,res)=>{
        res.sendFile(path.join(__dirname, './client/build/index.html'))
    })
}
server.listen(PORT, ()=>console.log(`Server has been initialize ${PORT}`))