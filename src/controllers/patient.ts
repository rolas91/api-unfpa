import {getRepository, getConnection,getManager} from 'typeorm';
import bcrypt from 'bcrypt';
import Patient from '../entity/Patient';
import Users from '../entity/User';
import moment from 'moment-timezone';

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
    gestationWeeks:number;
    pathologicalAntecedents:string;
    treatmentsReceived:string;
    medicalObservations:string;
}):Promise<any> => {
    const entityManager = getManager();
    const {userid,doctorid, pathologicalAntecedents, treatmentsReceived, medicalObservations, gestationWeeks, } = data;   

    const user = await getRepository(Users).findOne({
        where:{
            id:userid,
            typeUser:'paciente'
        }
    });
    
    if(user != undefined){
        const patient = await getRepository(Patient).createQueryBuilder("patient")
        .leftJoinAndSelect("patient.user", "user")
        .where("user.id = :userid", {userid}).getOne();

        const doctor = await getRepository(Users).findOne({
            where:{
                id:doctorid,
                typeUser:'medico'
            }
        });

        if(patient != undefined){
            const validaPatientDoctor = await entityManager.query(`SELECT * FROM patient_doctors_user pu 
            inner join patient p on pu.patientId = p.id inner join user u on p.userId = u.id WHERE pu.userId = ${doctorid} AND p.userId = ${patient.user.id}`)

            if(validaPatientDoctor.length == 0){                               
                const newPatient = getRepository(Patient).create({
                    user, 
                    brigadista:null,
                    gestationWeeks,  
                    pathologicalAntecedents, 
                    treatmentsReceived, 
                    medicalObservations, 
                    doctors:[doctor],
                    gestationWeeksDate:moment().tz("America/Managua").format('YYYY-MM-DD HH:mm:ss')
                })
                await getRepository(Patient).save(newPatient);
                return {
                    code:"success",
                    message:'Paciente asignada correctamente.', 
                }             
            }else{
               return {
                    code:"duplicate",
                    message:'Esta paciente ya se te ha asignado.', 
                }
            }
        }else{
            const newPatient = getRepository(Patient).create({
                user, 
                brigadista:null,
                gestationWeeks,  
                pathologicalAntecedents, 
                treatmentsReceived, 
                medicalObservations, 
                doctors:[doctor],
                gestationWeeksDate:moment().tz("America/Managua").format('YYYY-MM-DD HH:mm:ss')
            })
            return await getRepository(Patient).save(newPatient);
        }
    }else{
        return {
            code:"error",
            message:'verifique que sea un usurio valido', 
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

    gestationWeeks:number;
    pathologicalAntecedents:string;
    treatmentsReceived:string;
    medicalObservations:string;
}): Promise<any> => {
    const {doctorid, gestationWeeks,  pathologicalAntecedents, treatmentsReceived, medicalObservations, firstname, lastname, email, cedula, birth, phone, typeAuth, typeUser} = data;
   
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
        gestationWeeks,  
        pathologicalAntecedents, 
        treatmentsReceived, 
        medicalObservations, 
        doctors:[doctor],
        gestationWeeksDate:moment().tz("America/Managua").format('YYYY-MM-DD HH:mm:ss')
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
    .orderBy("user.firstname","ASC")
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
    .orderBy('user.firstname','ASC')
    .groupBy('user.id')
    .getRawMany();
  }

  const getpatientDetail = async(data:{
    userid:number;
  }): Promise<any> =>{
      const {userid} = data;      
    let response = await getRepository(Patient)
    .createQueryBuilder("patient")
    .leftJoinAndSelect("patient.user","user")
    .leftJoinAndSelect("patient.appointments","appointments")
    .where("user.id = :id",{id:userid})
    .getMany();

    response.map((val, index) => {
        val.gestationWeeksDate = <any> moment(response[index].gestationWeeksDate).format('YYYY-MM-DD HH:mm:ss');
        val.appointments.map((val,index2) => {
            val.gestationWeeksDate = <any> moment(response[index].appointments[index2].gestationWeeksDate).format('YYYY-MM-DD HH:mm:ss');
        })
    })

    return response;
  }

export {register, getPatients, getPatientsAndTotalAppointment, getpatientDetail, registerPatient, addBrigadista, getPatientsAndTotalAppointmentByBrigadist,getDoctorByPatient}