import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';


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

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;
}