import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import User from "./User"

@Entity()
export default class Notification{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    title:string;
    
    @Column()
    text:string;
    
    @Column('time')
    hour:Date
    
    @ManyToOne(() => User, user => user.messages)
    user:User;
}