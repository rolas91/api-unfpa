import {getRepository} from 'typeorm';
import _ from 'lodash';
import Users from '../entity/User';

// get the unser info from db
const info = async (id: any): Promise<any> => {
  // const user = await Users.findById(id);
  const user = await getRepository(Users).findOne(id);
  if (!user) throw new Error('user not found');
  return _.omit(user, 'password', '__v');
};

const avatar = async (userId: string, avatarPath: string): Promise<void> => {
  const user = await getRepository(Users).findOne({where:{id:userId}});

  if(user){
     getRepository(Users).merge(user, {avatar:avatarPath});
     await getRepository(Users).save(user);
  }

  // await Users.findByIdAndUpdate(userId, {
  //   $set: {
  //     avatar: avatarPath
  //   }
  // });
};

export { info, avatar };
