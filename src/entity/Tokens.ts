import { JsonObject } from 'swagger-ui-express';
import {Entity, Column, PrimaryGeneratedColumn} from'typeorm';


@Entity()
export default class Token{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true, nullable:false})
    jwt: string;

    @Column()
    payload:number;
}