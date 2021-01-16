import 'reflect-metadata';
import express from 'express';
import cron = require('node-cron');
import path from 'path';
import {ExpressPeerServer} from 'peer';
// import mongoose from 'mongoose';
import {createConnection} from 'typeorm';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import fs from 'fs';
import cors from 'cors';
import api from './routes';
import * as user from './controllers/users'
const PORT = process.env.PORT || 7000;
require('dotenv').config();

const socketio = require('socket.io')

process.env.TZ = 'America/Managua'; // zona horaria de la app

const app = express();
// public files
app.use('/static',express.static(__dirname + '/public'));
createConnection();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.set('views',  './views');
app.set('view engine', 'pug');

var server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

//Chat Server
var io = socketio.listen(server)

io.on('connection',function(socket) {

    // console.log(`Connection : SocketId = ${socket.id}`)
   
    var userName = '';
    
    socket.on('subscribe', function(data) {
        // console.log('subscribe trigged')
        const room_data = JSON.parse(data)
        userName = room_data.userName;
        const roomName = room_data.roomName;
    
        socket.join(`${roomName}`)
        // console.log(`Username : ${userName} joined Room Name : ${roomName}`)
        
        io.to(`${roomName}`).emit('newUserToChatRoom',userName);

    })

    socket.on('unsubscribe',function(data) {
        // console.log('unsubscribe trigged')
        const room_data = JSON.parse(data)
        const userName = room_data.userName;
        const roomName = room_data.roomName;
    
        // console.log(`Username : ${userName} leaved Room Name : ${roomName}`)
        socket.broadcast.to(`${roomName}`).emit('userLeftChatRoom',userName)
        socket.leave(`${roomName}`)
    })

    socket.on('newMessage',function(data) {
        // console.log('newMessage triggered')

        const messageData = JSON.parse(data)
        const messageContent = messageData.messageContent
        const roomName = messageData.roomName
        const state = messageData.state

        // console.log(`[Room Number ${roomName}] ${userName} : ${messageContent}`)

        const chatData = {
            userName : userName,
            messageContent : messageContent,
            roomName : roomName,
            state : state
        }
        user.addMessages(chatData.messageContent,chatData.roomName, chatData.state)
        socket.broadcast.to(`${roomName}`).emit('updateChat',JSON.stringify(chatData)) 
    })

    socket.on('sendNotificationAppointment', function(data){
        const userData = JSON.parse(data);
        const userId = userData.userId;
        console.log("jajaa loco",userData)
        socket.join(`${userId}`)
        cron.schedule('* * * * *', () => {
            console.log("hola loco man ya me estoy ejecutando")
            let message = "hola ya estas listo para la cita"
            socket.broadcast.to(`${userId}`).emit('sendNotificationAppointment',JSON.stringify(message))
        });
    });

    // socket.on('typing',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('typing triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('typing')
    // })

    // socket.on('stopTyping',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('stopTyping triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('stopTyping')
    // })

    socket.on('disconnect', function () {
        // console.log("One of sockets disconnected from our server.")
    });
})


const peerServer = ExpressPeerServer(server, {
    path: '/videocallapp'
});

app.use('/peerjs', peerServer);

api(app);


