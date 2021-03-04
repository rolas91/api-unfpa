import {getRepository, getManager} from 'typeorm';
import fetch from 'node-fetch';
import moment from 'moment-timezone';
import moment2 from 'moment';
import Appointment from '../entity/Appointment';
import Notification from '../entity/Notification';

const cancelAppointment = async(data:{
    appointment:number;
    reason:string;
}) =>{
    const {appointment,reason} = data;
    try{
        return await getRepository(Appointment).update(appointment,{reasonCancel:reason, cancel:true})
    }catch(e){
        console.log(e);
    }
}

const register = async(data:{
    patient:any;
    doctor:any;
    gestationWeeks:number;
    reportOfFetalMovements:string;
    arObro:string;
    typeAppointment:string;
    otherRemarks:string;
    plans:string;
    mainReasonForTheConsultation:string;
    diagnostics:string;
    date: Date;
    hour:Date;
    note:string
}): Promise<any> => {
    const {patient, doctor, gestationWeeks, reportOfFetalMovements,arObro,typeAppointment,otherRemarks,plans, diagnostics, mainReasonForTheConsultation,date, hour,note} = data;
    console.log( patient);
    
    let response = await getRepository(Appointment).findOne({
        where:{
            patient,
            date,
            hour,
            cancel:false
        }
    })


   if(response == undefined){
    const newAppointment = getRepository(Appointment).create({
        patient,
        doctor,
        gestationWeeks,
        reportOfFetalMovements,
        arObro,
        mainReasonForTheConsultation,
        diagnostics,
        plans,
        otherRemarks,
        typeAppointment,
        date:date,
        hour:hour,
        note,
        gestationWeeksDate:moment().tz("America/Managua").format('YYYY-MM-DD HH:mm:ss')
    });
     
    return await getRepository(Appointment).save(newAppointment);
   }else{
       return false;
   }
}
const getAppointment = async ():Promise<any> => {
  return await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .getMany();
}

const getDateForReminder = async() => {
    try{
        executeReminder24horas();
        executeReminderForDay();
    }catch(e){
        console.log(`error ${e}`)
    }
}

const executeReminderForDay = async() =>{
    let hourNow = moment().tz("America/Managua").format('HH:mm:ss');
    let dateNow = moment().tz("America/Managua").format('YYYY-MM-DD');
    let dateTime = moment().tz("America/Managua").format('YYYY-MM-DD HH:mm:ss');
    let nowDay = moment(dateTime).format('YYYY-MM-DD');
    let nowAddHour = moment(dateTime).add(60,'minutes').format('YYYY-MM-DD HH:mm:ss')
    let hourRest = moment(nowAddHour).subtract(3, 'minutes').format('HH:mm:ss');
    let hourAdd = moment(nowAddHour).add(2, 'minutes').format('HH:mm:ss');
    let fcm_tokens = [];
    let dataAppointment ;
      
    console.log(nowDay.toString(), 'hora menos 3 '+hourRest.toString(), 'hora mas 2 '+ hourAdd.toString())
    let result = await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .leftJoinAndSelect("patient.user", "user")
    .leftJoinAndSelect("appointment.doctor", "doctor")
    .leftJoinAndSelect("patient.brigadista", "brigadista")
    .where("appointment.date = :today", {today:nowDay})
    .andWhere(`appointment.hour BETWEEN '${hourRest}' AND '${hourAdd}'`)
    .andWhere('appointment.fcm2 = false')
    .getMany()
    
    if(result.length > 0){
        console.log("execute reminder for day");
        for(let appointment of result){
            dataAppointment = {date:appointment.date, hour:appointment.hour}
            let brigadistToken = appointment.patient.brigadista != null ? appointment.patient.brigadista.token : ''
            fcm_tokens.push(appointment.doctor.token, appointment.patient.user.token, brigadistToken)
        }

        var notification = {
            'title': 'Recuerda Tu Cita Médica',
            'text': `Tiene una Cita dentro de una hora, exactamente el ${dataAppointment.date} a las ${dataAppointment.hour}.Favor estar pendiente dentro de la app al menos 10 min antes de la cita`
          };
        
          var notification_body = {
            'notification': notification,
            'registration_ids': fcm_tokens
          }
        
        fetch('https://fcm.googleapis.com/fcm/send',{
        'method':'POST',
        'headers':{
            'Authorization':`key=${process.env.FCM!}`,
            'Content-Type':'application/json'
        },
        'body':JSON.stringify(notification_body)
        }).then(async() => {
            try{                
                let hourNow = moment().tz("America/Managua").format('HH:mm:ss');
                fcm_tokens.length = 0;
                console.log('successfully')
                for(let appointment of result){
                    await getRepository(Appointment).update(appointment.id,{fcm2:true})                           
                }

                for(let appointment of result){
                    if(appointment.patient.user != null){
                        let user =  getRepository(Notification).create({
                            title:notification_body.notification.title,
                            text:notification_body.notification.text,
                            hour:hourNow,
                            user:appointment.patient.user
                        })
                        getRepository(Notification).save(user);
                    }
                }

                for(let appointment of result){
                    if(appointment.patient.brigadista != null){
                        let brigadista = getRepository(Notification).create({
                            title:notification_body.notification.title,
                            text:notification_body.notification.text,
                            hour:hourNow,
                            user:appointment.patient.brigadista
                        })
                        getRepository(Notification).save(brigadista);
                    }
                }
                   
                    
                for(let appointment of result){
                    if(appointment.doctor != null){
                        let doctor = getRepository(Notification).create({
                            title:notification_body.notification.title,
                            text:notification_body.notification.text,
                            hour:hourNow,
                            user:appointment.doctor
                        })
                        getRepository(Notification).save(doctor);
                    }
                }
            
                return {
                    message:'success'        
                }
            }catch(e){
                console.log(`error ${e}`);                
            }
            
        }).catch((error) => {
            console.log(`error ${error}`);
        });
    }
}

const executeReminder24horas = async() =>{
    let hourNow = moment().tz("America/Managua").format('HH:mm:ss');
    let dateNow = moment().tz("America/Managua").format('YYYY-MM-DD');
    let dateTime = moment().tz("America/Managua").format('YYYY-MM-DD HH:mm:ss');
    let nowAddDay = moment(dateTime).add(1,'d').format('YYYY-MM-DD');
    let hourRest = moment(dateTime).subtract(3, 'minutes').format('HH:mm:ss');
    let hourAdd = moment(dateTime).add(2, 'minutes').format('HH:mm:ss');
    let fcm_tokens = [];
    let dataAppointment ;
    
    console.log(nowAddDay.toString(), 'hora restada '+hourRest.toString(), 'hora agregada '+ hourAdd.toString())
    let result = await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .leftJoinAndSelect("patient.user", "user")
    .leftJoinAndSelect("appointment.doctor", "doctor")
    .leftJoinAndSelect("patient.brigadista", "brigadista")
    .where("appointment.date = :today", {today:nowAddDay})
    .andWhere(`appointment.hour BETWEEN '${hourRest}' AND '${hourAdd}'`)
    .andWhere('appointment.fcm = false')
    .getMany()
    
    if(result.length > 0){
        console.log('execute reminder for 24 hour');
        for(let appointment of result){
            dataAppointment = {date:appointment.date, hour:appointment.hour}
            let brigadistToken =appointment.patient.brigadista != null ? appointment.patient.brigadista.token : ''
           
            fcm_tokens.push(appointment.doctor.token, appointment.patient.user.token, brigadistToken )
        }

        var notification = {
            'title': 'Recuerda Tu Cita Médica',
            'text': `Tiene una Cita Médica mañana ${dataAppointment.date} a las ${dataAppointment.hour}.Favor estar pendiente dentro de la app al menos 10 min antes de la cita`
          };
        
          var notification_body = {
            'notification': notification,
            'registration_ids': fcm_tokens
          }
                
        fetch('https://fcm.googleapis.com/fcm/send',{
        'method':'POST',
        'headers':{
            'Authorization':`Bearer ${process.env.FCM!}`,
            'Content-Type':'application/json'
        },
        'body':JSON.stringify(notification_body)
        }).then(async() => {
            try{
                let hourNow = moment().tz("America/Managua").format('HH:mm:ss');
                fcm_tokens.length = 0;
                console.log('successfully')
                for(let appointment of result){
                    await getRepository(Appointment).update(appointment.id,{fcm:true})
                }

                for(let appointment of result){
                    if(appointment.patient.user != null){
                        let user =  getRepository(Notification).create({
                            title:notification_body.notification.title,
                            text:notification_body.notification.text,
                            hour:hourNow,
                            user:appointment.patient.user
                        })
                        getRepository(Notification).save(user);
                    }
                }
                for(let appointment of result){
                    if(appointment.patient.brigadista != null){
                        let brigadista = getRepository(Notification).create({
                            title:notification_body.notification.title,
                            text:notification_body.notification.text,
                            hour:hourNow,
                            user:appointment.patient.brigadista
                        })
                        getRepository(Notification).save(brigadista);
                    }
                }

                for(let appointment of result){
                    if(appointment.doctor != null){
                        let doctor = getRepository(Notification).create({
                            title:notification_body.notification.title,
                            text:notification_body.notification.text,
                            hour:hourNow,
                            user:appointment.doctor
                        })
                        getRepository(Notification).save(doctor);
                    }
                }
                
                return {
                    message:'success'        
                }
            }catch(e){
                console.log(`error ${e}`);                
            }
            
        }).catch((error) => {
            console.log(`error ${error}`);
        });
    }
}

const updateAppointment = async(data:{
    appointment:number;
    gestationWeeks:number;
    reportOfFetalMovements:string;
    arObro:string;
    mainReasonForTheConsultation:string;
    diagnostics:string;
    plans:string;
    otherRemarks:string;
}):Promise<any> => {
    try{
        const {appointment, gestationWeeks,reportOfFetalMovements,arObro,mainReasonForTheConsultation,diagnostics,plans,otherRemarks} = data;
        let response = await getRepository(Appointment).findOne({
            where:{
                id:appointment
            }
        })
        if(response != undefined || response != null){
            return await getRepository(Appointment).update(response.id,{gestationWeeks,reportOfFetalMovements,arObro,mainReasonForTheConsultation,diagnostics,plans,otherRemarks, gestationWeeksDate:moment().tz("America/Managua").format('YYYY-MM-DD HH:mm:ss')})
        }else{
            return null
        }
    }catch(e){
        console.log(`error ${e}`);        
    }
}


const updateAppointmentReprogramation = async(data:{
    typeAppointment:string;
    date: Date;
    hour:Date;
    note:string;
    appointment:number;
}):Promise<any> => {
    try{
        const {typeAppointment,date,hour,note,appointment} = data;
        let response = await getRepository(Appointment).findOne({
            where:{
                id:appointment
            }
        })
        if(response != undefined || response != null){
            return await getRepository(Appointment).update(response.id,{typeAppointment,date,hour,note})
        }else{
            return null
        }
    }catch(e){
        console.log(`error ${e}`);        
    }
}


const getAppointmentByDoctor = async (doctorId:any, today:Date) => {   
    const entityManager = getManager();
    const responseQuery = entityManager.query(`
        SELECT appointment.patientId, appointment.doctorId, appointment.gestationWeeks, appointment.reportOfFetalMovements, appointment.arObro, appointment.mainReasonForTheConsultation, appointment.diagnostics, appointment.plans, appointment.otherRemarks, appointment.typeAppointment, appointment.hour,appointment.date, appointment.gestationWeeksDate,appointment.cancel, 
        patient.userId, user.firstname, user.lastname, user.email, user.typeAuth, user.typeUser
        FROM appointment 
        inner join patient on patient.id = appointment.patientId
        inner join user on user.id = patient.userId
        where appointment.date = '${today}' and 
        appointment.doctorId = ${doctorId} 
        order by appointment.hour asc 
    `);
    return responseQuery;

}

const getAppointmentsByBrigadista = async (brigadistId:any, today:Date) => {   
    const entityManager = getManager();
    const responseQuery = entityManager.query(`
        SELECT appointment.patientId, appointment.doctorId, appointment.gestationWeeks, appointment.reportOfFetalMovements, appointment.arObro, appointment.mainReasonForTheConsultation, appointment.diagnostics, appointment.plans, appointment.otherRemarks, appointment.typeAppointment, appointment.hour,appointment.date, appointment.gestationWeeksDate,
        patient.userId, user.firstname, user.lastname, user.email, user.typeAuth, user.typeUser
        FROM appointment 
        inner join patient on patient.id = appointment.patientId
        inner join user on user.id = patient.userId
        where appointment.date = '${today}' and 
        patient.brigadistaId = ${brigadistId} 
        order by appointment.hour asc 
    `);
    return responseQuery;

}

const getAppointmentByHour = async (doctorId:any, today:Date, hour:string) => {
    let dateTime = moment().tz("America/Managua").format('YYYY-MM-DD');
    let hourNow = moment().tz("America/Managua").format('HH:mm:ss');
    let hourAdd = moment(dateTime).add(15, 'minutes').format('HH:mm:ss');
   
    
    let response = await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .leftJoinAndSelect("patient.user", "user")
    .where("appointment.doctorId = :doctorId", {doctorId:doctorId})
    .andWhere("appointment.date = :today", {today:today})
    // .andWhere("appointment.hour >= :hour", {hour:hour})
    .andWhere("ADDTIME(appointment.hour,'00:15:00') >= :hour", {hour:hour})
    .andWhere("appointment.cancel != 1")
    // .andWhere(`appointment.hour BETWEEN '${hour}' AND  ADDTIME (appointment.hour, '00: 10: 00')`)
        
    .orderBy("appointment.hour","ASC")
    .limit(1)
    .getOne();
     
    if(response != undefined){        
        response.gestationWeeksDate =  <any> moment(response.gestationWeeksDate).format('YYYY-MM-DD HH:mm:ss');
        response.patient.gestationWeeksDate =  <any> moment(response.patient.gestationWeeksDate).format('YYYY-MM-DD HH:mm:ss');
    }  
    
    
    return response;
}


const getAppointmentByPatient = async(userId:any,today:Date, hour:any) => {
    return await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .leftJoinAndSelect("appointment.doctor", "doctor")
    .leftJoinAndSelect("patient.user", "user")
    .where("user.id = :id", {id:userId})
    .andWhere("appointment.date = :today", {today:today})
    .andWhere("appointment.hour >= :hour", {hour:hour})
    .orderBy("appointment.hour","ASC")
    .getOne();
}

const getAppointmentByBrigadista = async(brigadistaid:any,today:Date, hour:any) => {
    return await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .leftJoinAndSelect("appointment.doctor", "doctor")
    .leftJoinAndSelect("patient.user", "user")
    .leftJoin("patient.brigadista", "brigadista")
    .where("brigadista.id = :id", {id:brigadistaid})
    .andWhere("appointment.date = :today", {today:today})
    .andWhere("appointment.hour >= :hour", {hour:hour})
    .orderBy("appointment.hour","ASC")
    .getOne();
}

const getAppointmentsByPatient = async(userId:any,today:Date) => {
    return await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .leftJoinAndSelect("appointment.doctor", "doctor")
    .leftJoinAndSelect("patient.user", "user")
    .where("user.id = :id", {id:userId})
    .andWhere("appointment.date = :today", {today:today})
    .orderBy("appointment.hour","ASC")
    .getMany();
}

const getAppointmentNotes = async(userId:any) => {
    const entityManager = getManager();
    const responseQuery = entityManager.query(`
        SELECT appointment.note
        FROM appointment 
        left join patient on patient.id = appointment.patientId
        left join user on user.id = patient.userId
        where user.id = ${userId} 
        order by appointment.hour asc 
    `);
    return responseQuery;
}
export {
    register, 
    getAppointment, 
    getAppointmentByDoctor, 
    getAppointmentByHour, 
    getAppointmentByPatient, 
    getAppointmentNotes, 
    getAppointmentsByPatient,
    getAppointmentByBrigadista,
    getAppointmentsByBrigadista,
    getDateForReminder,
    updateAppointment,
    updateAppointmentReprogramation,
    cancelAppointment
}

