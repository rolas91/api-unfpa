import {Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Entity} from 'typeorm';

@Entity()
export default class Patient{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    userId:number;

    @Column(
        comment:'tipo de sangre'
    )
    bloodtype:string;

    @Column(
        comment:'Semanas de embarazo'
    )
    weekspregnant:string;

    @Column(
        comment:'Enfermedades o padecimientos'
    )
    ailment:string;

    @Column(
        comment:'Tratamiento, medicacion'
    )
    medication:string;

    @Column(
        comment:'Alergias y reacciones'
    )
    allergicReactions:string;

    @Column(
        comment:'Informe medico'
    )
    medicalReport:string;

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;
}