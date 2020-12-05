import {getRepository} from 'typeorm';
import _ from 'lodash';
import Users from '../entity/User';

// get the unser info from db
const getUsers = async (): Promise<any> => {
  // const user = await Users.findById(id);
  const user = await getRepository(Users).find();
  if (!user) throw new Error('user not found');
  return _.omit(user, 'password', '__v');
};

const getUser = async (data:{
  identification:string;
}): Promise<any> => {
  const {identification} = data;
  // const user = await Users.findById(id);
  const user = await getRepository(Users).find({
    where:{
      cedula:identification
    }
  });
  if (!user) throw new Error('user not found');
  return _.omit(user, 'password', '__v');
};


export { getUsers, getUser };