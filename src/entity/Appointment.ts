import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne} from 'typeorm';
import Patient from "./Patient";

@Entity()
export default class Appointment{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => Patient, patient => patient.appointments)
    patient:Patient;

    @Column()
    doctorId:number;

    @Column()
    note:string;

    @Column({
        type:"enum",
        enum:["presencial","remoto"],
        default:"remoto"
    })
    typeAppointment:string;

    @Column()
    date:Date;

    @Column()
    hour:Date;

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;

}