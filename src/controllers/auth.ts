import bcrypt from 'bcrypt';
import validator from 'validator';
import _ from 'lodash';
import {transporter} from '../config/mailer';
import {getRepository} from 'typeorm';

import jsonwebtoken from 'jsonwebtoken';

import Users from '../entity/User';


// create a new user and save into db
const register = async (data: {
  firstname: string;
  lastname:string,
  email: string;
  password: string;
  cedula: string;
  birth:Date;
  phone:string;
  typeAuth:string;
  typeUser:string;
  centerId:number;
}): Promise<any> => {
  const { firstname, lastname, email,cedula, birth,phone, typeUser, typeAuth, centerId } = data;
  let { password } = data;
 
  if (!validator.isEmail(email)) throw new Error('invalid email');

  password = await bcrypt.hash(password, 10);

  const newUser = getRepository(Users).create({
    firstname,
    lastname,
    email,
    cedula,
    birth,
    phone,
    password,
    typeAuth,
    typeUser,
    centerId
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
  typeUser:string;
  typeAuth:string;
}): Promise<any> => {
  const { email, password, typeUser,typeAuth } = data;

  const user:any  = await getRepository(Users).findOne(
    {
      email: email,
      typeUser:typeUser
    }
  );

  // const user = await Users.findOne({ email });

  if (!user || user.typeAuth != typeAuth)
    throw {
      code: 404,
      message: `El usuario con este ${email} no esta registrado en el sistema o no se ha autenticado correctamente`
    };
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (isValidPassword) {
    return _.omit(user, 'password', '__v');
  }
  throw { code: 403, message: 'Invalid password' };
};

const sendMailResetPassword = async(data:{
  email:string;
}):Promise<any> => {
  const {email} = data;
  let searchUser = await getRepository(Users).findOne({
    where:{
      email:email
    }
  });

  const token = jsonwebtoken.sign({userId:searchUser.id},process.env.SECRET!,{expiresIn:'10m'})
  let verificationLink = `https://api-unfpa.herokuapp.com/new-password`;

  try{
    if(searchUser != undefined){
     await transporter.sendMail({
      from: '"Unfpa " <rsanchezbaltodano@gmail.com>', // sender address
      to: searchUser.email, // list of receivers
      subject: "Recuperar Contraseña", // Subject line
      html: `
      <b>Por favor de click en el siguiente link, o pega este enlace en tu navegador web para completar el proceso</b><br>
      <a href="${verificationLink}">${verificationLink}</a>
      `, // html body
    });
    return {
      message:'success'        
    }
  }

  }catch(e){
    console.log(`error send mail ${e}`);
    throw {
      message:'success'        
    }
  }
}

const resetPassword = async(data:{
  email:string;
  password:string;
}):Promise<any> => {

  const {email} = data;
  let {password} =data;
  password = await bcrypt.hash(password, 10);
  
  let searchUser = await getRepository(Users).findOne({
    where:{
      email:email
    }
  });
 
  if(searchUser != undefined){
    await getRepository(Users).update(searchUser.id,{password})
    return {
        message:'success'        
    }
  }else{
    throw {
      message:'error', 
    }
  }

}

const postToken = async(data:{
  userId:number;
  token:string;
}):Promise<any> => {

  const {userId} = data;
  let {token} =data;
  
  let searchUser = await getRepository(Users).findOne({
    where:{
      userId:userId
    }
  });
 
  if(searchUser != undefined){
    return await getRepository(Users).update(searchUser.id,{token})
  }
}

export { register, login, resetPassword, sendMailResetPassword, postToken };
