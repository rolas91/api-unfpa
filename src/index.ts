import 'reflect-metadata';
import express from 'express';
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

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

api(app);

// mongoose.set('useCreateIndex', true);


// mongoose
//   .connect(process.env.MONGO!, {
//     useNewUrlParser: true
//   })
//   .then(() => {
//     
//   })
//   .catch((e) => {
//     console.error(`error to trying connected to mongodb ${e}`);
//   });


