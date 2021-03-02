import { getRepository } from 'typeorm';
import Notification from '../entity/Notification';
import User from '../entity/User';

const getNotifications = async(data:{userid:number;}):Promise<any> =>{
    const {userid} = data;
    return await getRepository(Notification).createQueryBuilder("notification")
                        .leftJoin("notification.user","user")
                        .where("user.id = :userid",{userid:userid})
                        .orderBy("notification.id", "DESC")
                        .limit(5)
                        .getMany();
}


export {getNotifications};