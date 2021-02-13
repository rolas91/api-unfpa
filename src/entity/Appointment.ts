import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne} from 'typeorm';
import Patient from "./Patient";
import User from "./User";

@Entity()
export default class Appointment{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => Patient, patient => patient.appointments)
    patient:Patient;

    @ManyToOne(() => User, user => user.appointments)
    @Column({
        type:'int',
        name:'doctorId'
    })
    doctor:User;

    @Column()
    gestationWeeksDate:Date;

    @Column({     
        type:'decimal',
        precision : 10 ,  
        scale : 2  ,   
        comment:'Semanas de gestacion',
    })
    gestationWeeks:number;

    @Column({
        comment:'Reporte de movimientos fetales',
    })
    reportOfFetalMovements:string;

    @Column()
    arObro:string;

    @Column({comment:'Motivo principal de la consulta'})
    mainReasonForTheConsultation:string

    @Column({comment:'Diagnostico'})
    diagnostics:string

    @Column({comment:'Planes'})
    plans:string

    @Column({comment:'Otras observaciones'})
    otherRemarks:string;

    @Column({
        type:"enum",
        enum:["presencial","telemedicina"],
        default:"telemedicina"
    })
    typeAppointment:string;

    @Column({type:'date'})
    date:Date;

    @Column('time')
    hour:Date;

    @Column({
        default:false
    })
    fcm:boolean

    @Column({
        default:false
    })
    fcm2:boolean

    @Column()
    note:string;

    @Column({default:false})
    cancel:boolean;

    @Column()
    reasonCancel:string;

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;


}