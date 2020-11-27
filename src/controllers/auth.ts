import bcrypt from 'bcrypt';
import validator from 'validator';
import _ from 'lodash';
import {getRepository} from 'typeorm';

import Users from '../entity/User';


// create a new user and save into db
const register = async (data: {
  firstname: string;
  lastname:string,
  email: string;
  password: string;
  phone:string;
  typeAuth:string;
  typeUser:string;
  date: Date;
}): Promise<any> => {
  const { firstname, lastname, email, phone, typeUser, typeAuth } = data;
  let { password } = data;
  let date = new Date;

  if (!validator.isEmail(email)) throw new Error('invalid email');

  password = await bcrypt.hash(password, 10);

  const newUser = getRepository(Users).create({
    firstname,
    lastname,
    email,
    phone,
    password,
    typeAuth,
    typeUser,
    date
  });

  const result = await getRepository(Users).save(newUser);

  // const user = await Users.create({
  //   username,
  //   email,
  //   password 
  // });
  return _.omit(result, 'password', '__v');
};

// login user and creates a jwt token

const login = async (data: {
  email: string;
  password: string;
  typeAuth:string
}): Promise<any> => {
  const { email, password, typeAuth } = data;

  const user:any  = await getRepository(Users).findOne(
    {
      email: email
    }
  );

  // const user = await Users.findOne({ email });

  if (!user || user.typeAuth != typeAuth)
    throw {
      code: 404,
      message: `El usuario con este ${email} no esta registrado en el sistema o no se ha autenticado correctamente `
    };
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (isValidPassword) {
    return _.omit(user, 'password', '__v');
  }
  throw { code: 403, message: 'Invalid password' };
};

export { register, login };
