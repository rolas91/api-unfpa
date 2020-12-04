import {getRepository} from 'typeorm';
import Center from '../entity/Center';

// get the unser info from db
const getCenters = async (): Promise<any> => {
  // const user = await Users.findById(id);
  const center = await getRepository(Center).find();
  if (!center) throw new Error('center not found');
  return {
      center
  };
};



export { getCenters };