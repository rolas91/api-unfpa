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
    
    @Column()
    date:Date
    
    @ManyToOne(() => User, user => user.messages)
    userId:User;
}