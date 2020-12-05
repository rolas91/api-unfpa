import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export default class Citas{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    patientId:number;

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

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @Column()
    hour:Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;

}