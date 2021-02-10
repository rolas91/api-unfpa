import {getRepository, getManager} from 'typeorm';
import _ from 'lodash';
import Users from '../entity/User';
import Message from '../entity/Messages';

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

  return entityManager.query(`SELECT * FROM user WHERE phone = '${identification}' OR cedula = '${identification}'`)
};

//obtengo usuario por parametro like
const getUserLike = async (data:{
  params:string;
  type:string;
  doctorId:number
}): Promise<any> => {
  const entityManager = getManager();
  const {params, type, doctorId} = data;

  if(type == "1"){
  
  // return await entityManager.query(`SELECT p.id as idPaciente, u.* FROM user u 
  // inner join patient p on u.id = p.userId WHERE (concat(u.firstname,' ',u.lastname) 
  // LIKE '${params}%' OR u.email LIKE '${params}%' OR u.phone LIKE '${params}%' OR u.cedula LIKE '${params}%') and u.typeUser = 'paciente'`)
  return await entityManager.query(`SELECT * FROM user u 
  inner join patient p on u.id = p.userId inner join patient_doctors_user pu on p.id = pu.patientId WHERE (concat(u.firstname,' ',u.lastname) 
  LIKE '${params}%' OR u.email LIKE '${params}%' OR u.phone LIKE '${params}%' OR u.cedula LIKE '${params}%') and pu.userId = ${doctorId}`)
  }
  else{
    return await entityManager.query(`SELECT * FROM user  WHERE (concat(firstname,' ',lastname) LIKE '${params}%' OR 
    email LIKE '${params}%' OR phone LIKE '${params}%' OR cedula LIKE '${params}%') and typeUser = 'paciente' `)
  }
  
};

const getUserDoctors = async (data:{id:number}) => {
  const {id} = data;
  return await getRepository(Users)
  .createQueryBuilder('user')
  .where("user.typeUser = 'medico'")
  .andWhere("user.id <> :id",{id:id})
  .getMany();
}

const getUsersTypeBrigadista = async (): Promise<any> => {
  return await getRepository(Users).find({where:{typeUser:3}});
};

const getMessages = async(data:{
  sender:number, 
  receive:number
}):Promise<any> => {
  const {sender, receive} = data;
  
  return await getRepository(Message).createQueryBuilder("message")
              .leftJoinAndSelect("message.sender", "sender")
              .leftJoinAndSelect("message.receiver", "receiver")
              // .leftJoinAndSelect("receiver.messages", "messages")
              .where("sender.id = :sender", {sender})
              .andWhere("receiver.id = :receive", {receive})
              .orWhere("sender.id = :receive", {receive})
              .andWhere("receiver.id = :sender", {sender})
              .getMany();              
}

const addMessages = async(message:string, roomName:any, state:string):Promise<any> => {
  const room = roomName.split(",")
  const newMessage = getRepository(Message).create({
    message:message,
    date:new Date,
    sender:room[0],
    receiver:room[1],
    state:state
  });
  for(let user of room){    
    const sendMessage = await getRepository(Users).findOne({where:{id : user}});
    if(sendMessage != undefined){
      sendFCM('Nuevo mensaje de prueba',message, sendMessage.token)
    }
    
  }
  await getRepository(Message).save(newMessage)
}

const sendFCM = async(title, message, fcmToken) =>{
  var notification = {
    'title': title,
    'text': message
  };

  var notification_body = {
    'notification': notification,
    'registration_ids': fcmToken
  }

  fetch('https://fcm.googleapis.com/fcm/send',{
  'method':'POST',
  'headers':{
      'Authorization':`key=${process.env.FCM!}`,
      'Content-Type':'application/json'
  },
  'body':JSON.stringify(notification_body)
  }).then(resp => {
    if(resp){
      return true;
    }else{
      return false;
    }
  }).catch((error) => {
      console.log(`error ${error}`);
  });
}


export { getUserDoctors, getUsers, getUser, getUsersTypeBrigadista, getOnlyUser, addMessages, getMessages, getUserLike};