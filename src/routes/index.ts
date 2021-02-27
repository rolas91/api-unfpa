import jsonwebtoken from 'jsonwebtoken';

import _, { join } from 'lodash';
import { Application, response } from 'express';
import * as auth from '../controllers/auth';
import * as profile from '../controllers/profile';
import * as user from '../controllers/users';
import * as center from '../controllers/center';
import * as patient from '../controllers/patient';
import * as appointment from '../controllers/appointments';
import * as categorylist from '../controllers/categorytips';
import * as notification from '../controllers/notification';
import * as joinuser from '../controllers/joinroom';
import * as reports from '../controllers/reports';
import * as tip from '../controllers/tips';
import fetch from 'node-fetch';

import tokens from '../controllers/tokens';

import { isLogin, isAuth } from '../middlewares/isLogin';

import uploader from '../middlewares/uploader';


const EXPIRES_IN = 60 * 60; // 1 hour

export default (app: Application): void => {

  app.post('/api/v1/auth/fcm/send', (req, res) =>{
    var notification = {
      'title': 'Title of notification',
      'text': 'subtitle'
    };
    var fcm_tokens = ['emRb0DwEZ80:APA91bEM6soiDaAM9NrDQj-b4YtOfUj3DZndkDAn0BRgZl8m7-jd9InAmrv6zHA6MhBrWbkPspqGpJpJ5jrRtkL01KN28AoBs3qEemvJnHpv8hP-s-EuqBeZOToR7IIPY2yyi58o-pu6'];

    var notification_body = {
      'notification': notification,
      'registration_ids': fcm_tokens
    }
    fetch('https://fcm.googleapis.com/fcm/send',{
      'method':'POST',
      'headers':{
        'Authorization':'key='+'AAAAMlKxqsI:APA91bHAMWrxCQfE-pirqMRpJbaE0q-YhO0b36EcplbqAQ3ed_BZpZv29QNuOPxrGsFJhXyR_roCFaLKoK9m8CcIG9QhplujT2wk2YMMtsKzUh16V1OSsus02EsrjvuIFe3gp7WRx06C',
        'Content-Type':'application/json'
      },
      'body':JSON.stringify(notification_body)
    }).then(() => {
      res.status(200).json('successfully')
    }).catch((error) => {
      res.status(400).json('something went wrong!')
      console.log(error);
    });
  });
  
  app.get('/new-password/:token', (req, res) => {
    res.render('changepass',{token:req.params.token});     
  });

  app.get('/', (req, res) => {
    res.render('login');     
  });
  app.get('/dashboard/:token?', isAuth ,(req, res) => {
    res.render('panel');     
  });

  app.get('/api/v1/create/report', isLogin ,async(req, res) => {
    try{
      let response = await reports.report();
      res.status(200).json({response});
    }catch(e){
      console.log(e.error)
    }
  });

  app.post('/api/v1/auth/fcm/token', async(req, res) => {
    try{
      let response = await auth.postToken(req.body)
      if(response != undefined){
        res.status(200).json({
          message:'success',
          data:'no necesary data'
        })
      }
    }catch(e){
      console.log(`error ${e.message}`)
    }
  });

  app.post('/success-recovery-password', async(req, res) => {
    try{
      const result = await auth.resetPassword(req.body)
      if(result.message === 'success'){
        res.render('success',{message:"Has cambiado correctamente tu contraseña"});   
      }else if(result.message === 'not-same-password'){
        res.render('changepass',{message:"Las contraseñas no coinciden"}); 
      }else{
        res.render('changepass',{message:"Ha habido un error al cambiar tu contraseña"});  
      }
    }catch(e){
      console.log(`error ${e.message}`)
      res.render('changepass',{message:"Ha habido un error al cambiar tu contraseña"});
    }
  });

  app.post('/api/v1/auth/encrypt-password', async(req, res) => {
    try {
      const psEncrypt = await auth.encryptPassword(req.body);
      res.status(200).json(psEncrypt);
    } catch (error) {
      console.log(error);
      
    }
  })
  
  // authenticate
  app.post('/api/v1/auth/resetpassword', async(req, res) => {
    try{
      const result = await auth.sendMailResetPassword(req.body)
      res.status(200).json(result);
    }catch(e){
      console.log(`error ${e.message}`)
      res.status(200).json({message:e.message})
    }
  });

  app.post('/api/v1/auth/resetpassword-mail', async(req, res) => {
    try{
      const result = await auth.resetPassword(req.body)
      res.status(200).json(result);
    }catch(e){
      console.log(`error ${e.message}`)
      res.status(200).json({message:e.message})
    }
  });

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

  
  app.post('/api/v1/user/getdoctors', async(req, res) => {
    try {
      const result = await user.getUserDoctors(req.body);
      res.status(200).json({
        message:'successfully',
        doctors:result
      })
    } catch (error) {
      res.status(200).json({ 
        message: 'unsuccess',
        doctors:[]
      });
    }
  })

  // app.post('/api/v1/user/getListdoctorsbypatient', async(req, res) => {
  //   try {
  //     const result = await user.getListAndMessageDoctors(req.body);
  //     res.status(200).json({
  //       message:'successfully',
  //       patient:result
  //     })
  //   } catch (error) {
  //     res.status(200).json({ https://api-unfpa.herokuapp.com/dashboard
  //       message: 'unsuccess',
  //       doctors:[]
  //     });
  //   }
  // })

  app.post('/api/v1/user/getmessage', async(req, res) => {
      try{
        const response = await user.getMessages(req.body);
        res.status(200).json({response})
      }catch(error){
        res.status(500).send({ message: error.message });
      }
  });

  app.post('/api/v1/message/readmessagepatient', async(req, res) => {
    try{
      const response = await user.readmessagePatient(req.body);
      res.status(200).json({response})
    }catch(error){
      res.status(500).send({ message: error.message });
    }
});

app.post('/api/v1/message/readmessagedoctor', async(req, res) => {
  try{
    const response = await user.readmessageDoctor(req.body);
    res.status(200).json({response})
  }catch(error){
    res.status(500).send({ message: error.message });
  }
});

  app.post('/api/v1/user/countmessage', async(req, res) => {
    try{
      const result = await user.totalMessage(req.body);
      res.status(200).json({result})
    }catch(error){
      res.status(200).send({ message: error.message });
    }
});

  app.get('/api/v1/user/user-info', isLogin, async (req, res) => {
    try {
      console.log('userId', req.userId!);
      const response = await profile.info(req.userId!);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  app.post('/api/v1/user/getusers', async (req, res) => {
    try {
      const response = await user.getUsers();
      res.status(200).json({users:response});
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/user/getuser', async (req, res) => {
    try {
      const response = await user.getUser(req.body);
 
      if(response.length > 0){
          res.status(200).send({message:"ok", response:response[0]});
      }else{
        res.status(200).send({message:"error", response:{}})
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/user/getonlyuser', async (req, res) => {
    try {
      const response = await user.getOnlyUser(req.body);
 
      if(response.length > 0){
          res.status(200).send({message:"ok", response:response[0]});
      }else{
        res.status(200).send({message:"error", response:{}})
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/user/getuserlike', async (req, res) => {
    try {
      const response = await user.getUserLike(req.body);
      if(response.length > 0){
          res.status(200).send({message:"ok", response:response});
      }else{
        res.status(200).send({message:"error", response:{}})
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/user/getbrigadista', async (req, res) => {
    try {
      const response = await user.getUsersTypeBrigadista();
 
      if(response.length > 0){
          res.status(200).send({message:"ok", response:response});
      }else{
        res.status(200).send({message:"error", response:{}})
      }
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
      res.status(500).send({ message: error.message});
    }
  });

  //patients

  app.post('/api/v1/patients/addbrigadist', async(req, res) => {
    try{
        const response = await patient.addBrigadista(req.body)
        res.status(200).json({
          message:'successfully',
          data:response
        });
    }catch(error){
      res.status(500).send({ message: error.message });
    }
  })

  app.post('/api/v1/patients/addpatient', async(req, res) => {
    try {
      const response = await patient.registerPatient(req.body)
      res.status(200).json({
        response
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  app.post('/api/v1/patients/register', async(req, res) => {
    try {
      const response = await patient.register(req.body)
      res.status(200).json({
        message:'successfully',
        success:true,
        data:response
      });
    } catch (error) {
      res.status(200).send({
         message: error.message,
         success:false,
         data:{}
      });
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

  app.post('/api/v1/patients/andtotalappointment', async(req, res) => {
    try {
      const result = await patient.getPatientsAndTotalAppointment(req.body.docid);
      res.status(200).json({
        message:'successfully',
        patient:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  app.post('/api/v1/patients/getdoctors', async(req, res) => {
    try {
      const result = await patient.getDoctorByPatient(req.body.userid);
      res.status(200).json({
        message:'successfully',
        patient:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  app.post('/api/v1/patients/totalappointmentbybrigadist', async(req, res) => {
    try {
      const result = await patient.getPatientsAndTotalAppointmentByBrigadist(req.body.brigadistaid);
      res.status(200).json({
        message:'successfully',
        patient:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  app.post('/api/v1/patients/detail', async(req, res) => {
    try {
     
      const result = await patient.getpatientDetail(req.body);
      res.status(200).json({
        message:'successfully',
        patient:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  app.post('/api/v1/patients/patientlist', async(req, res) => {
    try {
     
      const result = await patient.getListPatientWithMessage(req.body);
      res.status(200).json({
        message:'successfully',
        patient:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  //Appointment
  app.post('/api/v1/appointment/cancel',async(req, res) => {
      try{
        let result = await appointment.cancelAppointment(req.body)
        if(result != undefined){
          res.status(200).json({
            message:'successfuly'
          })
        }else{
          res.status(200).json({
            message:'unsuccessfuly'
          })
        }
      }catch(e){
        res.status(200).json({
          message:`successfuly ${e}`
        })
      }
  });
  app.post('/api/v1/appointment/register', async(req, res) => {
    try {
      const response = await appointment.register(req.body)
      if(response){
        res.status(200).json({
          message:'successfuly',
          data:response
        });
      }else{
        res.status(200).json({
          message:'unsuccessfuly',
          data:{}
        });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })

  app.post('/api/v1/appointment/update',async(req, res) => {
    try {
      const response = await appointment.updateAppointment(req.body)
      res.status(200).json({
        message:'successfully',
        data:response
      });
    } catch (error) {
      res.status(200).send({ message:'unsuccessful', data:error.message });
    }
  })

  app.post('/api/v1/appointment/reprogramation',async(req, res) => {
    try {
      const response = await appointment.updateAppointmentReprogramation(req.body)
      res.status(200).json({
        message:'successfully',
        data:response
      });
    } catch (error) {
      res.status(200).send({ message:'unsuccessful', data:error.message });
    }
  })

  app.get('/api/v1/appointment/getAll', async(req, res) => {
    try {
      const result = await appointment.getAppointment();
      res.status(200).json({
        message:'successfully',
        data:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/appointment/getbydoctor', async(req, res) => {
    try {
      const result = await appointment.getAppointmentByDoctor(req.body.doctorid, req.body.today);
      res.status(200).json({
        message:'successfully',
        data:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/appointments/getbybrigadista', async(req, res) => {
    try {
      const result = await appointment.getAppointmentsByBrigadista(req.body.brigadistaid, req.body.today);
      res.status(200).json({
        message:'successfully',
        data:result
      })
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/appointment/getbyday', async(req, res) => {
    try {
      const result = await appointment.getAppointmentByHour(req.body.doctorid, req.body.today, req.body.hour);
      if(result){
        res.status(200).json({
          message:'successfully',
          data:result
        })
      }else{
        res.status(200).json({
          message:'error',
          data:result
        })
      }
      
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/appointment/getbypatient', async(req, res) => {
    try {
      const result = await appointment.getAppointmentByPatient(req.body.patient, req.body.today, req.body.hour);
      if(result){
        res.status(200).json({
          message:'successfully',
          data:result
        })
      }else{
        res.status(200).json({
          message:'null',
          data:result
        })
      }
      
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  

  app.post('/api/v1/appointment/getbybrigadista', async(req, res) => {
    try {
      const result = await appointment.getAppointmentByBrigadista(req.body.brigadistaid, req.body.today, req.body.hour);
      if(result){
        res.status(200).json({
          message:'successfully',
          data:result
        })
      }else{
        res.status(200).json({
          message:'null',
          data:result
        })
      }
      
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/appointments/getbypatient', async(req, res) => {
    try {
      const result = await appointment.getAppointmentsByPatient(req.body.patient, req.body.today);
      if(result){
        res.status(200).json({
          message:'successfully',
          data:result
        })
      }else{
        res.status(200).json({
          message:'null',
          data:result
        })
      }
      
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  app.post('/api/v1/appointment/getnotes', async(req, res) => {
    try {
      const result = await appointment.getAppointmentNotes(req.body.userid);
      if(result){
        res.status(200).json({
          message:'successfully',
          data:result
        })
      }else{
        res.status(200).json({
          message:'null',
          data:result
        })
      }
      
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  //categories tips
  app.get('/api/v1/category-tips/all', async(req, res) => {
    try{
      const result = await categorylist.getCategoryTips();
      if(result){
        res.status(200).json({
          categories:result
        })
      }
    }catch(e){
      res.status(500).json({
        message:'error'+e
      })
    }
  });

  app.post('/api/v1/tips/detail', async(req, res) => {
    try{
      const result = await tip.getTips(req.body.categoryid);
      if(result){
        res.status(200).json({
          tips:result
        })
      }else{
        res.status(200).json({
          tips:'empty'
        })
      }
    }catch(e){
      res.status(500).json({
        message:'error'+e
      })
    }
  });

  app.post('/api/v1/notification', async(req, res) => {
    try{
      const result = await notification.getNotifications(req.body);
      if(result.length > 0){
        res.status(200).json({
          message:'success',
          notifications:result
        });
      }else{
        res.status(200).json({
          message:'unsuccess',
          notifications:''
        });
      }
    }catch(e){
      console.log(`error ${e}`)
    }
  });

  app.post('/api/v1/joinusers', async(req, res) => {
      let result = await joinuser.joinUsers(req.body);
      res.status(200).json({result})
  });
};

