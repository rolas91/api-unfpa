import {getRepository} from 'typeorm';
import bcrypt from 'bcrypt';
import Patient from '../entity/Patient';
import Users from '../entity/User';
import Appointment from '../entity/Appointment';

const register = async(data:{
    doctorid:number;
    //campos para usuario
    firstname: string;
    lastname:string,
    email: string;
    password: string;
    cedula: string;
    birth:Date;
    phone:string;
    typeAuth:string;
    typeUser:string;
    ////
    bloodtype:string;
    weekspregnant:string;
    ailment:string;
    medication:string;
    allergicReactions:string;
    medicalReport:string;
}): Promise<any> => {
    const {doctorid, bloodtype,  weekspregnant, ailment, medication, allergicReactions, medicalReport, firstname, lastname, email, cedula, birth, phone, typeAuth, typeUser} = data;
   
    let { password } = data;
    password = await bcrypt.hash(password, 10);

    const doctor = await getRepository(Users).findOne({
        where:{
            id:doctorid,
            typeUser:'medico'
        }
    });
    console.log(doctor);
    
   if(doctor){
    const newUser = getRepository(Users).create({
        firstname,
        lastname,
        email,
        cedula,
        birth,
        phone,
        password,
        typeAuth,
        typeUser
    });
    
    const result = await getRepository(Users).save(newUser);
    const user = await result;
    const newPatient = getRepository(Patient).create({
        user, 
        bloodtype,  
        weekspregnant, 
        ailment, 
        medication, 
        allergicReactions, 
        medicalReport,
        doctors:[doctor]
    })

    return await getRepository(Patient).save(newPatient);
   }else{
    throw {
        code:"error",
        message:'tiene que enviar el id del medico', 
    }
   }
}

const getPatients = async () => {
  return await getRepository(Patient).createQueryBuilder("patient")
    .leftJoinAndSelect("patient.user", "user")
    // .where()
    // .where("user.name = :name", { name: "Timber" })
    .getMany();
}

const getPatientsAndTotalAppointment = async (doctorId:any) => {
    return await getRepository(Patient)
    .createQueryBuilder("patient")
    .leftJoinAndSelect("patient.user","user")
    .leftJoin("patient.appointments","appointments")
    .leftJoin("patient.doctors", "doctors")
    .where("doctors.id = :id",{id:doctorId})
    .addSelect('COUNT(CASE WHEN appointments.typeAppointment = 1 THEN 1 ELSE NULL END) as totalPresencial')
    .addSelect('COUNT(CASE WHEN appointments.typeAppointment = 2 THEN 1 ELSE NULL END) as totalRemoto')
    // .addSelect('COUNT(DISTINCT(appointments.id)) as totalRemote')
    .groupBy('patient.id')
    .getRawMany();
  }

export {register, getPatients, getPatientsAndTotalAppointment}