import {getRepository, getManager} from 'typeorm';
import fetch from 'node-fetch';
import moment from 'moment-timezone';
import Appointment from '../entity/Appointment';

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
}): Promise<any> => {
    const {patient, doctor, gestationWeeks, reportOfFetalMovements,arObro,typeAppointment,otherRemarks,plans, diagnostics, mainReasonForTheConsultation,date, hour} = data;

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
        date,
        hour
    });
    return await getRepository(Appointment).save(newAppointment);
}
const getAppointment = async ():Promise<any> => {
  return await getRepository(Appointment).createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.patient", "patient")
    .getMany();
}

const getDateForReminder = async() => {
    try{
        console.log(moment().tz("America/Managua").format())
        var notification = {
            'title': 'Notificación para las citas',
            'text': 'Estas es una prueba de envio'
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
            console.log('successfully')
          }).catch((error) => {
            console.log(`error ${error}`);
          });
    }catch(e){
        console.log(`error ${e}`)
    }
}

const getAppointmentByDoctor = async (doctorId:any, today:Date) => {   
    const entityManager = getManager();
    const responseQuery = entityManager.query(`
        SELECT appointment.patientId, appointment.doctorId, appointment.gestationWeeks, appointment.reportOfFetalMovements, appointment.arObro, appointment.mainReasonForTheConsultation, appointment.diagnostics, appointment.plans, appointment.otherRemarks, appointment.typeAppointment, appointment.hour,appointment.date, 
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
        SELECT appointment.patientId, appointment.doctorId, appointment.gestationWeeks, appointment.reportOfFetalMovements, appointment.arObro, appointment.mainReasonForTheConsultation, appointment.diagnostics, appointment.plans, appointment.otherRemarks, appointment.typeAppointment, appointment.hour,appointment.date, 
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

const getAppointmentByHour = async (doctorId:any, today:Date, hour:any) => {
    return await getRepository(Appointment).createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.patient", "patient")
      .leftJoinAndSelect("patient.user", "user")
      .where("appointment.doctorId = :doctorId", {doctorId:doctorId})
      .andWhere("appointment.date = :today", {today:today})
      .andWhere("appointment.hour >= :hour", {hour:hour})
      .orderBy("appointment.hour","ASC")
      .limit(1)
      .getOne();
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
    getDateForReminder
}

