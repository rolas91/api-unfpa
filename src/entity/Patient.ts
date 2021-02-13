import {Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Entity, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn} from 'typeorm';
import User from './User';
import Appointment from './Appointment';

@Entity()
export default class Patient{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => User, user => user.patients)
    user:User;

    @ManyToOne(() => User, user => user.patients,{nullable:true})
    brigadista:User;

    @Column({
        type:'decimal',
        precision : 10 ,  
        scale : 2 ,
        comment:'Semanas de gestacion',
    })
    gestationWeeks:number;

    @Column({
        comment:'Antecedentes patologicos',
    })
    pathologicalAntecedents:string;

    @Column({
        comment:'Tratamientos recibidos',
    })
    treatmentsReceived:string;

    @Column({
        comment:'Observaciones médicas',
    })
    medicalObservations:string;

    @OneToMany(() => Appointment, appointment => appointment.patient)
    appointments: Appointment[];

    @OneToMany(() => Appointment, appointment => appointment.patient)
    nextappointment: Appointment[];

    @ManyToMany(() => User, user => user.id)
    @JoinTable()
    doctors:User[]


    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;
}