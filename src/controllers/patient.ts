import {getRepository} from 'typeorm';
import bcrypt from 'bcrypt';
import Patient from '../entity/Patient';
import Users from '../entity/User';

const register = async(data:{
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
    const { bloodtype,  weekspregnant, ailment, medication, allergicReactions, medicalReport, firstname, lastname, email, cedula, birth, phone, typeAuth, typeUser} = data;
    let { password } = data;
    password = await bcrypt.hash(password, 10);

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
        medicalReport
    })

    return await getRepository(Patient).save(newPatient);
}

const getPatients = async () => {
  return await getRepository(Patient).createQueryBuilder("patient")
    .leftJoinAndSelect("patient.user", "user")
    // .where()
    // .where("user.name = :name", { name: "Timber" })
    .getMany();
}

export {register, getPatients}