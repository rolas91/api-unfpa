import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import User from "./User"

@Entity()
export default class Message{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => User, user => user.messagessender)
    sender:User;

    @ManyToOne(() => User, user => user.messagesreceiver)
    receiver:User;

    @Column({type:"text", nullable:true})
    message:string;

    @Column({default:true})
    read:boolean;

    @Column({nullable:true})
    date:Date

    @Column({nullable:true})
    state:string;
}