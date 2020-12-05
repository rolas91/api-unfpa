import {getRepository} from 'typeorm';
import Appointment from '../entity/Appointment';

const register = async(data:{
    patientId:number;
    doctorId:number;
    note:string;
    typeAppointment:string;
    date: Date;
    hour:Date;
}): Promise<any> => {
    const {patientId, doctorId, note, typeAppointment, date, hour} = data;

    const newAppointment = getRepository(Appointment).create({
        patientId,
        doctorId,
        note,
        typeAppointment,
        date,
        hour
    });
    return await getRepository(Appointment).save(newAppointment);
}

export {register}