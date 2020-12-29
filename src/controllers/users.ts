import {getRepository, getManager} from 'typeorm';
import _ from 'lodash';
import Users from '../entity/User';

// get the unser info from db
const getUsers = async (): Promise<any> => {
  // const user = await Users.findById(id);
  const user = await getRepository(Users).find();
  if (!user) throw new Error('user not found');
  // return _.omit(user, 'password', '__v');
  return user;
};

//get user by identification cedula o phone
const getUser = async (data:{
  identification:string;
}): Promise<any> => {
  const entityManager = getManager();
  const {identification} = data;
  // const user = await Users.findById(id);
  // const user = await getRepository(Users).find({
  //   where:[{ phone:identification}, {cedula:identification}]
  // });
  return entityManager.query(`SELECT * FROM user  as usuario
                        inner join patient as paciente on paciente.userId = usuario.id
                        where usuario.phone = '${identification}' OR usuario.cedula = '${identification}'`)

  // if (!user) throw new Error('user not found');
  // return _.omit(user, 'password', '__v');
};

//get only user by identification cedula o phone
const getOnlyUser = async (data:{
  identification:string;
}): Promise<any> => {
  const entityManager = getManager();
  const {identification} = data;

  return entityManager.query(`SELECT * FROM user where phone = '${identification}' OR cedula = '${identification}'`)
};

const getUsersTypeBrigadista = async (): Promise<any> => {
  return await getRepository(Users).find({where:{typeUser:3}});
};


export { getUsers, getUser, getUsersTypeBrigadista, getOnlyUser };