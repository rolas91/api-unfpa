import {getRepository, getManager} from 'typeorm';
import Appointment from '../entity/Appointment';

const register = async(data:{
    patient:any;
    doctorId:number;
    note:string;
    typeAppointment:string;
    date: Date;
    hour:Date;
}): Promise<any> => {
    const {patient, doctorId, note, typeAppointment, date, hour} = data;

    const newAppointment = getRepository(Appointment).create({
        patient,
        doctorId,
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
   
    // return await getRepository(Appointment).createQueryBuilder("appointment")
    //   .leftJoinAndSelect("appointment.patient", "patient")
    //   .leftJoinAndSelect("patient.user", "user")
    //   .where("appointment.doctorId = :doctorId", {doctorId:doctorId})
    //   .andWhere("appointment.date = :today", {today:today})
    //   .orderBy("appointment.hour","ASC")
    //   .limit(1)
    //   .getMany();
    console.log(today);
    
    const entityManager = getManager();
    const responseQuery = entityManager.query(`
        SELECT * FROM appointment 
        left join patient on patient.id = appointment.patientId
        left join user on user.id = patient.userId
        where appointment.date = '${today}' and 
        appointment.doctorId = ${doctorId} 
        order by appointment.hour asc 
        limit 1, 18446744073709551615
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
export {register, getAppointment, getAppointmentByDoctor, getAppointmentByHour}