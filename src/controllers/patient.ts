import {getRepository} from 'typeorm';
import Patient from '../entity/Patient';

const register = async(data:{
    userId:number;
    bloodtype:string;
    weekspregnant:string;
    ailment:string;
    medication:string;
    allergicReactions:string;
    medicalReport:string;
}):Promise<any> => {
    const {userId, bloodtype,  weekspregnant, ailment, medication, allergicReactions, medicalReport} = data;

    const newPatient = getRepository(Patient).create({
        userId, 
        bloodtype,  
        weekspregnant, 
        ailment, 
        medication, 
        allergicReactions, 
        medicalReport
    })

    return await getRepository(Patient).save(newPatient);
}