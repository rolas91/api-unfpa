import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import Patient from './Patient';
import Appointment from './Appointment';
import Message from './Messages';

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

    @Column({type:'date', nullable: true})
    birth:Date;

    @Column()
    phone:string;

    @Column()
    password: string;

    @Column({nullable: true})
    avatar: string;

    @Column({
        type:"enum",
        enum:["email","facebook","gmail"],
        default:'email'
    })
    typeAuth:string;

    @Column({
        type:"enum",
        enum:["paciente","medico","brigadista","admin"],
        default:"paciente"
    })
    typeUser:string;

    @Column({nullable: true})
    centerId:number;

    @Column({nullable: true})
    token:string;

    @Column({nullable:true})
    emailToken:string;

    @OneToMany(() => Patient, patient => patient.user)
    patients: Patient[];

    @OneToMany(() => Appointment, appointment => appointment.doctor)
    appointments: Appointment[];


    @OneToMany(() => Message, messager => messager.receiver)
    messagesreceiver:Message[];

    @OneToMany(() => Message, messages => messages.sender)
    messagessender:Message[];


    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;
}