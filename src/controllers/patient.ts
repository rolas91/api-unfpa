import {getRepository} from 'typeorm';
import Patient from '../entity/Patient';
import User from '../entity/User';

const register = async(data:{
    user:any;
    bloodtype:string;
    weekspregnant:string;
    ailment:string;
    medication:string;
    allergicReactions:string;
    medicalReport:string;
}): Promise<any> => {
    const {user, bloodtype,  weekspregnant, ailment, medication, allergicReactions, medicalReport} = data;

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
  return await getRepository(User).createQueryBuilder("user")
    .leftJoinAndSelect("user.patients", "patient")
    // .where("user.name = :name", { name: "Timber" })
    .getOne();
}

export {register, getPatients}