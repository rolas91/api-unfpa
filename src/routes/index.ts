import jsonwebtoken from 'jsonwebtoken';

import _ from 'lodash';
import { Application } from 'express';
import * as auth from '../controllers/auth';
import * as profile from '../controllers/profile';
import * as user from '../controllers/users';
import * as center from '../controllers/center';
import * as patient from '../controllers/patient';
import * as appointment from '../controllers/appointments';

import tokens from '../controllers/tokens';

import { isLogin } from '../middlewares/isLogin';

import uploader from '../middlewares/uploader';


const EXPIRES_IN = 60 * 60; // 1 hour

export default (app: Application): void => {

  
  app.get('/', (req, res) => {
    res.send('Api');     
  });
  
  // authenticate
  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const response = await auth.register(req.body);
      const payload = { id: response.id };
      const token = await jsonwebtoken.sign(payload, process.env.SECRET || 'supersecret', {
        expiresIn: EXPIRES_IN
      });
      console.log('data', token);
      await tokens.newRefreshToken(token, payload);
      res.status(200).send({
        token,
        expiresIn: EXPIRES_IN
      });
    } catch (e) {
      console.log(e);
      if (e.errors) {
        let duplicatedValues = [] as string[];
        if (e.errors.email) {
          duplicatedValues.push('email');
        }
        if (e.errors.username) {
          duplicatedValues.push('username');
        }
        
        res
        .status(409)
        .send({ message: e.message, duplicatedFields: duplicatedValues });
        return;
      }
      
      res.status(500).send({ message: e.message });
    }
  });
  
  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const response = await auth.login(req.body);
            
      const payload = { id: response.id };
      const token = await jsonwebtoken.sign(payload, process.env.SECRET!, {
        expiresIn: EXPIRES_IN
      });
      
      await tokens.newRefreshToken(token, payload);
      res.status(200).send({
        token,
        expiresIn: EXPIRES_IN,
        response
      });
    } catch (error) {
      console.log(error);
      res.status(401).send({ message: error.message });
    }
  });
  // create a new jwt token for an especific user by Id
  app.post('/api/v1/auth/refresh-token', async (req, res) => {
    try {
      const { token } = req.headers;
      const data = await tokens.refresh(token as string);
      if (!data) throw new Error('invalid refreshToken');
      console.log('token refrescado');
      res.status(200).send(data);
    } catch (error) {
      console.log('error refresh-token', error);
      if (error.message === '403') {
        res.status(403).send({ message: 'invalid token' });
      } else {
        res.status(403).send({ message: error.message });
      }
    }
  });
  
  //users
  app.get('/api/v1/user/user-info', isLogin, async (req, res) => {
    try {
      console.log('userId', req.userId!);
      const response = await profile.info(req.userId!);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  app.get('/api/v1/user/getusers', isLogin, async (req, res) => {
    try {
      const response = await user.getUsers();
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.get('/api/v1/user/getuser', async (req, res) => {
    try {
      const response = await user.getUser(req.body);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/user/update-avatar',isLogin, uploader.single('attachment'), async (req, res) => {
    try {
      const { file } = req;
      if (!file) {
        throw new Error('Please upload a file');
      }
      await profile.avatar(req.userId!, req.filePath!);
      res.status(200).send(req.filePath);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }
  );
  
  //centers
  app.get('/api/v1/centers', async (req, res) => {
    try {
      
      const response = await center.getCenters();
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  //patients
  app.post('/api/v1/patients/register', async(req, res) => {
    try {
      const response = await patient.register(req.body)
      res.status(200).json({
        message:'successfully',
        data:response
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  app.get('/api/v1/patients/getAll', async(req, res) => {
    try {
      const result = await patient.getPatients();
      res.status(200).json({
        message:'successfully',
        data:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

//Appointment
app.post('/api/v1/appointment/register', async(req, res) => {
    try {
      const response = await appointment.register(req.body)
      res.status(200).json({
        message:'successfully',
        data:response
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

};

