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

    @Column("text")
    message:string;

    @Column({default:false})
    read:boolean;

    @Column()
    date:Date

    @Column()
    state:string;
}