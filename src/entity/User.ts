import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import Patient from './Patient';
import Appointment from './Appointment';

@Entity()
export default class User{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({unique:true})
    email: string;

    @Column()
    cedula: string;

    @Column()
    birth:Date;

    @Column()
    phone:string;

    @Column()
    password: string;

    @Column()
    avatar: string;

    @Column({
        type:"enum",
        enum:["email","facebook","gmail"],
        default:'email'
    })
    typeAuth:string;

    @Column({
        type:"enum",
        enum:["paciente","medico","brigadista"],
        default:"paciente"
    })
    typeUser:string;

    @OneToMany(() => Patient, patient => patient.user)
    patients: Patient[];

    @OneToMany(() => Appointment, appointment => appointment.doctor)
    appointments: Appointment[];


    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;
}