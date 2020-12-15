import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import CategoryTips from './CategoryTips';


@Entity()
export default class Tips {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    title:string;

    @Column()
    description:string;

    @Column()
    url_img:string

    @CreateDateColumn({name:'create_at'})
    create_at:Date;

    @UpdateDateColumn({name:'update_at'})
    update_at:Date

    @ManyToOne(() => CategoryTips, categorytips=>categorytips.tips)
    @Column({
        type:'int',
        name:'categorytipsId'
    })
    categorytips:CategoryTips


}