import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import User from "./User"

@Entity()
export default class Notification{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:true})
    title:string;
    
    @Column({nullable:true})
    text:string;
    
    @Column({type:'time', nullable:true})
    hour:Date
    
    @ManyToOne(() => User, user => user.messagesreceiver)
    user:User;
}