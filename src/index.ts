import 'reflect-metadata';
import express from 'express';
import {ExpressPeerServer} from 'peer';
// import mongoose from 'mongoose';
import {createConnection} from 'typeorm';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import fs from 'fs';
import cors from 'cors';
import api from './routes';
const PORT = process.env.PORT || 7000;
require('dotenv').config();

const socketio = require('socket.io')

process.env.TZ = 'America/Managua'; // zona horaria de la app

const app = express();
createConnection();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.set('view engine', 'ejs');

// public files
app.use(express.static('public'));

const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

//Chat Server
var io = socketio.listen(server)

io.on('connection',function(socket) {

    console.log(`Connection : SocketId = ${socket.id}`)
   
    var userName = '';
    
    socket.on('subscribe', function(data) {
        console.log('subscribe trigged')
        const room_data = JSON.parse(data)
        userName = room_data.userName;
        const roomName = room_data.roomName;
    
        socket.join(`${roomName}`)
        console.log(`Username : ${userName} joined Room Name : ${roomName}`)
        
        io.to(`${roomName}`).emit('newUserToChatRoom',userName);

    })

    socket.on('unsubscribe',function(data) {
        console.log('unsubscribe trigged')
        const room_data = JSON.parse(data)
        const userName = room_data.userName;
        const roomName = room_data.roomName;
    
        console.log(`Username : ${userName} leaved Room Name : ${roomName}`)
        socket.broadcast.to(`${roomName}`).emit('userLeftChatRoom',userName)
        socket.leave(`${roomName}`)
    })

    socket.on('newMessage',function(data) {
        console.log('newMessage triggered')

        const messageData = JSON.parse(data)
        const messageContent = messageData.messageContent
        const roomName = messageData.roomName

        console.log(`[Room Number ${roomName}] ${userName} : ${messageContent}`)

        const chatData = {
            userName : userName,
            messageContent : messageContent,
            roomName : roomName
        }
        socket.broadcast.to(`${roomName}`).emit('updateChat',JSON.stringify(chatData)) // Need to be parsed into Kotlin object in Kotlin
    })

    // socket.on('typing',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('typing triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('typing')
    // })

    // socket.on('stopTyping',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('stopTyping triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('stopTyping')
    // })

    socket.on('disconnect', function () {
        console.log("One of sockets disconnected from our server.")
    });
})


const peerServer = ExpressPeerServer(server, {
    path: '/videocallapp'
});

app.use('/peerjs', peerServer);

api(app);


