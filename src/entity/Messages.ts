import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import User from "./User"

@Entity()
export default class Message{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => User, user => user.messages)
    sender:User;

    @ManyToOne(() => User, user => user.messages)
    receiver:User;

    @Column("text")
    message:string;

    @Column()
    date:Date
}