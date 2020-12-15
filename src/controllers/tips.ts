import {getRepository} from 'typeorm'
import Tips from '../entity/Tips';

const getTips = async(categoryid):Promise<any> =>{
    return await getRepository(Tips).find({categorytips:categoryid})
}

export { getTips}