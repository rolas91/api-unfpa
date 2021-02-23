import {getRepository, getManager} from 'typeorm';
import User from '../entity/User';


const report = async():Promise<any> =>{
    try {
        // return await getRepository(User).createQueryBuilder('user').getMany()          
        const entityManager = getManager();
        const responseQuery = entityManager.query(`
            SELECT u.id AS Código, u.firstname AS Nombre, u.lastname AS Apellido, u.cedula AS NoCédula, YEAR(CURDATE())-YEAR(u.birth) AS Edad, ap.date AS FechaConsulta, 
            ap.hour AS HoraConsulta, ap.diagnostics as Diagnóstico,  usu.firstname as Medico, ap.note as NotasMédicas, ap.cancel as CitaCancelada
            FROM user AS u INNER JOIN patient as p on p.userId = u.id INNER JOIN appointment ap on ap.patientId = p.id INNER JOIN user AS usu on usu.id = ap.doctorId
        `);
        return responseQuery;              
    } catch (error) {
        console.log(error)
    }

}

export{
    report
}