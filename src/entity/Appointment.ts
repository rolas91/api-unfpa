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
    note:string;

    @Column({
        type:"enum",
        enum:["presencial","telemedicina"],
        default:"remoto"
    })
    typeAppointment:string;

    @Column({type:'date'})
    date:Date;

    @Column('time')
    hour:Date;

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;


}