import {getRepository} from 'typeorm';
import JoinRoom from '../entity/JoinRoom';

const joinUsers = async(data:{
room:string;
owner:number;
ownerArray:any;
}):Promise<any> => {
    let {room, ownerArray, owner} = data;
    let replaceOwnerArray = ownerArray.replace(/'/g, '"');
    let parseOwnerArray = JSON.parse(replaceOwnerArray)
    
    try{
        let search = await getRepository(JoinRoom).createQueryBuilder('joinroom')
                            .where("joinroom.owner = :owner", {owner})
                            .andWhere("joinroom.roomToken = :room", {room}).getOne()
        console.log(search)
        // if(search == undefined){            
        //     for(let dataOwner of parseOwnerArray){
        //         await getRepository(JoinRoom).create({
        //             roomToken:dataOwner.room,
        //             owner:dataOwner.owner
        //         })
        //     }
        // }else{
        //     return search
        // }                                
    }catch(e){
        console.log(`error ${e}`);        
    }
}

export {
    joinUsers
}