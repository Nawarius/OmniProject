require('dotenv').config()
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const app = express()
const {AntennaCoords} = require('./classes/AntennaCoords')
const {User} = require('./classes/User')

const server = http.createServer(app)
const io = socketio(server, {cors:{origin:'*'}})

const PORT = process.env.PORT || 4000

const Coords = new AntennaCoords()

const users = []

io.on('connection', socket => {  
    socket.on('join game', () => {
        const myAvatar = new User(socket.id) 
        users.push(myAvatar)
        const otherUsers = users.filter(user => user.getId() !== socket.id)
        if(otherUsers.length){
            socket.emit('get all users coords', otherUsers)
            socket.broadcast.emit('other user coords', myAvatar)
        }
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

    socket.on('my new coords', coords => {
        const myAvatar = users.find(item=>item.id === socket.id)
        myAvatar.setCoords(coords._x, coords._y, coords._z)
        socket.broadcast.emit('other user coords', myAvatar)
    })

    //WebRTC
    socket.on('join audio',()=>{
        const userExist = users.find(user => user.getId() === socket.id)
        if(!userExist){
            console.log('here')
            users.push(new User(socket.id))
        }
        const otherUser = users.find(user => user.getId() !== socket.id)
        if(otherUser){
            socket.emit('other user webrtc', otherUser.getId())
            socket.to(otherUser.getId()).emit('user joined to webrtc', socket.id)
        }
    })
    socket.on('offer', payload => {
        io.to(payload.target).emit('offer', payload)
    })
    socket.on('answer', payload => {
        io.to(payload.target).emit('answer', payload)
    })
    socket.on('ice-candidate', incoming => {
        io.to(incoming.target).emit('ice-candidate', incoming.candidate)
    })
    socket.on('disconnect', ()=>{
        io.emit('delete mesh', socket.id)
        const index = users.findIndex(user => user.getId() === socket.id)
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