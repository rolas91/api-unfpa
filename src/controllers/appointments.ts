import {getRepository, getManager} from 'typeorm';
import Appointment from '../entity/Appointment';

const register = async(data:{
    patient:any;
    doctor:any;
    note:string;
    typeAppointment:string;
    date: Date;
    hour:Date;
}): Promise<any> => {
    const {patient, doctor, note, typeAppointment, date, hour} = data;

    const newAppointment = getRepository(Appointment).create({
        patient,
        doctor,
        note,
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
const getAppointmentByDoctor = async (doctorId:any, today:Date) => {   
    const entityManager = getManager();
    const responseQuery = entityManager.query(`
        SELECT appointment.patientId, appointment.doctorId, appointment.note, appointment.typeAppointment, appointment.hour,appointment.date, 
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
    .leftJoinAndSelect("patient.brigadista", "brigadista")
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
export {register, getAppointment, getAppointmentByDoctor, getAppointmentByHour, getAppointmentByPatient, getAppointmentNotes, getAppointmentsByPatient,getAppointmentByBrigadista}

