import {getRepository, getConnection} from 'typeorm';
import bcrypt from 'bcrypt';
import Patient from '../entity/Patient';
import Users from '../entity/User';
import Appointment from '../entity/Appointment';

const addBrigadista = async(data:{
    userid:number;
    brigadistaid:number
}):Promise<any> => {
    const {brigadistaid, userid} = data;
    const brigadista = await getRepository(Users).findOne({id:brigadistaid});
   return  await getConnection()
    .createQueryBuilder()
    .relation(Users,"user")
    .update(Patient)
    .set({ 
        brigadista:brigadista
    })
    .where("user.id = :id", { id: userid })
    .execute();
}

const registerPatient = async(data:{
    userid:number;
    doctorid:number;
    bloodtype:string;
    weekspregnant:string;
    ailment:string;
    medication:string;
    allergicReactions:string;
    medicalReport:string;
}):Promise<any> => {
    const {userid,doctorid, bloodtype,  weekspregnant, ailment, medication, allergicReactions, medicalReport} = data;    
    const doctor = await getRepository(Users).findOne({
        where:{
            id:doctorid,
            typeUser:'medico'
        }
    });
    const user = await getRepository(Users).findOne({
        where:{
            id:userid,
        }
    });
    if(doctor && user){
        const newPatient = getRepository(Patient).create({
            user, 
            brigadista:null,
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
            message:'verifique que sea un usurio valido y un medico valido', 
        }
    }

}

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
    .groupBy('patient.id')
    .getRawMany();
  }

  const getDoctorByPatient = async (userid:any) => {
    return await getRepository(Patient)
    .createQueryBuilder("patient")
    .leftJoin("patient.user","user")
    .leftJoinAndSelect("patient.doctors", "doctors")
    .where("user.id = :id",{id:userid}).getRawMany();
  }

  const getPatientsAndTotalAppointmentByBrigadist = async (brigadistaid:any) => {
    return await getRepository(Patient)
    .createQueryBuilder("patient")
    .leftJoinAndSelect("patient.user","user")
    .leftJoin("patient.appointments","appointments")
    .where("patient.brigadistaid = :brigadistaid",{brigadistaid:brigadistaid})
    .addSelect('COUNT(CASE WHEN appointments.typeAppointment = 1 THEN 1 ELSE NULL END) as totalPresencial')
    .addSelect('COUNT(CASE WHEN appointments.typeAppointment = 2 THEN 1 ELSE NULL END) as totalRemoto')
    .groupBy('patient.id')
    .getRawMany();
  }

  const getpatientDetail = async(data:{
    userid:number;
  }): Promise<any> =>{
      const {userid} = data;      
    return await getRepository(Patient)
    .createQueryBuilder("patient")
    .leftJoinAndSelect("patient.user","user")
    .leftJoinAndSelect("patient.appointments","appointments")
    .where("user.id = :id",{id:userid})
    .getMany();
  }

export {register, getPatients, getPatientsAndTotalAppointment, getpatientDetail, registerPatient, addBrigadista, getPatientsAndTotalAppointmentByBrigadist,getDoctorByPatient}