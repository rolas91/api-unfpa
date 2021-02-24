import {getRepository, getManager} from 'typeorm';
import User from '../entity/User';


const report = async():Promise<any> =>{
    try {        
        const entityManager = getManager();
        const responseQuery = entityManager.query(`
            SELECT u.id AS Código, u.firstname AS Nombre, u.lastname AS Apellido, u.cedula AS NoCédula, YEAR(CURDATE())-YEAR(u.birth) + IF(DATE_FORMAT(CURDATE(),'%m-%d') > DATE_FORMAT(u.birth,'%m-%d'), 0 , -1 ) AS Edad, ap.date AS FechaConsulta, 
            ap.hour AS HoraConsulta, ap.diagnostics as Diagnóstico,  usu.firstname as Medico, ap.note as NotasMédicas, ap.cancel as CitaCancelada, p.pathologicalAntecedents as Antecedentespatológicos,
            p.treatmentsReceived as TratamientosRecibidos, p.medicalObservations as ObservacionesMédicas, ap.gestationWeeks as SemanasGestación, ap.reportOfFetalMovements as ReporteMovimientoFetales, 
            ap.arObro as ArOBro, ap.mainReasonForTheConsultation as RazónPrincipaldelaConsulta, ap.diagnostics as Diagnostico, ap.plans as Planes, ap.otherRemarks as OtrosComentarios
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