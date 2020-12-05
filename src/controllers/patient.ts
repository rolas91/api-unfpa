import {getRepository} from 'typeorm';
import Patient from '../entity/Patient'

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

const getPacients = async () => {
   
}

export {register}