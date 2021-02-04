import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"


@Entity()
export default class JoinRoom{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    roomToken:string;

    @Column()
    owner:number;
}