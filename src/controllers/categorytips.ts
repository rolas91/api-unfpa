import {getRepository} from 'typeorm'
import CategoryTips from '../entity/CategoryTips';

const getCategoryTips = async():Promise<any> =>{
    return await getRepository(CategoryTips).find()
}

export { getCategoryTips}