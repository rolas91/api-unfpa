import {Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Entity, ManyToOne, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import User from './User';
import Appointment from './Appointment';

@Entity()
export default class Patient{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => User, user => user.patients)
    user:User;

    @Column({
        comment:'tipo de sangre',
    })
    bloodtype:string;

    @Column({
        comment:'Semanas de embarazo',
    })
    weekspregnant:string;

    @Column({
        comment:'Enfermedades o padecimientos',
    })
    ailment:string;

    @Column({
        
        comment:'Tratamiento, medicacion',
    })
    medication:string;

    @Column({
        
        comment:'Alergias y reacciones',
    })
    allergicReactions:string;

    @Column({
        comment:'Informe medico',
    })
    medicalReport:string;

    @OneToMany(() => Appointment, appointment => appointment.patient)
    appointments: Appointment[];

    @ManyToMany(() => User, user => user.id)
    @JoinTable()
    doctors:User[]

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;
}