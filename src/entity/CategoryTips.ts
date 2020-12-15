import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm'
import Tips from './Tips';


@Entity()
export default class CategoryTips{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    @CreateDateColumn({name:'create_at'}) 
    create_at: Date;

    @UpdateDateColumn({name:'update_at'}) 
    update_at: Date;

    @OneToMany(()=>Tips, tips=>tips.categorytips)
    tips:Tips[]
}