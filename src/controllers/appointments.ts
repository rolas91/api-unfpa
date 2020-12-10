import {getRepository} from 'typeorm';
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
    // .where()
    // .where("user.name = :name", { name: "Timber" })
    .getMany();
}
const getAppointmentByDoctor = async (data:{
    doctorId:any;
}) => {
    const {doctorId} = data;
    return await getRepository(Appointment).createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.patient", "patient")
      .where("appointment.doctorId = :doctorId", {doctorId})
      // .where("user.name = :name", { name: "Timber" })
      .getMany();
  }
export {register, getAppointment, getAppointmentByDoctor}