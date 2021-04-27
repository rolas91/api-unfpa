import { getRepository, getManager, getConnection } from 'typeorm';
import _ from 'lodash';
import Users from '../entity/User';
import Message from '../entity/Messages';
import fetch from 'node-fetch';
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
    return await entityManager.query(`SELECT * FROM user u 
    inner join patient p on u.id = p.userId inner join patient_doctors_user pu on p.id = pu.patientId WHERE (concat(u.firstname,' ',u.lastname) 
    LIKE '${params}%' OR u.email LIKE '${params}%' OR u.phone LIKE '${params}%' OR u.cedula LIKE '${params}%') and pu.userId = ${doctorId} order by u.firstname asc `)
  }
  else{   
    return await entityManager.query(`SELECT u.id, u.firstname,u.lastname, u.email, u.cedula, u.birth, u.phone, u.password, u.avatar, u.typeAuth, u.typeUser, u.create_at, u.update_at, u.centerId, u.token, u.emailToken, p.userId, p.brigadistaId, p.gestationWeeks,p.gestationWeeksDate , p.pathologicalAntecedents, p.treatmentsReceived, p.medicalObservations, pu.patientId FROM user u 
    inner join patient p on u.id = p.userId inner join patient_doctors_user pu on p.id = pu.patientId WHERE (concat(u.firstname,' ',u.lastname) 
    LIKE '${params}%' OR u.email LIKE '${params}%' OR u.phone LIKE '${params}%' OR u.cedula LIKE '${params}%') GROUP BY p.userId order by u.firstname `)
    
  }
  
};

const getUserDoctors = async (data:{ 
  id:any
}) => {

  const {id} = data;
  const entityManager = getManager();

  const responseQuery = await entityManager.query(`
    SELECT DISTINCT us.id, us.firstname, us.lastname, (SELECT COUNT(*) from message m WHERE m.state = 'r' AND m.receiverId =  ${id} AND m.senderId = us.id AND m.read = 0) AS contador
    FROM user us 
    WHERE  us.id !=  ${id} AND  us.typeUser = 'medico'
    ORDER by us.firstname ASC
  `);
  // INNER JOIN message AS me ON  me.receiverId = us.id OR me.senderId =  us.id OR (me.receiverId = ${doctorId} OR me.senderId = ${doctorId}) 
  
  return responseQuery;
}


// const getListAndMessageDoctors = async (data:{ 
//   patient:any
// }) => {

//   const {patient} = data;

//   const entityManager = getManager();

//   const responseQuery = await entityManager.query(`
//     SELECT DISTINCT us.id, us.firstname, us.lastname, (SELECT COUNT(*) from message m WHERE m.state = 's' AND m.receiverId =  ${patient} AND m.senderId = us.id AND m.read = 0) AS contador
//     FROM user us INNER JOIN message AS me ON  me.receiverId = us.id OR me.senderId =  us.id OR (me.receiverId = ${patient} OR me.senderId = ${patient}) 
//     WHERE  us.id !=  ${patient} AND  us.typeUser = 'medico'
//     ORDER by us.firstname ASC
//   `);

//   return responseQuery;
// }

const totalMessage = async (data:{
  sender:number,
  receive:number
}) => {
  const {sender, receive} = data;
  return await getRepository(Message)
  .createQueryBuilder("message")
  .leftJoin("message.sender", "sender")
  .leftJoin("message.receiver", "receiver")
  .where("sender.id = :sender", {sender})
  .andWhere("receiver.id = :receive", {receive})
  .andWhere("message.state = 'r'")
  .orWhere("sender.id = :receive", {receive})
  .andWhere("receiver.id = :sender", {sender})
  .andWhere("message.state = 's'") 
  .addSelect('COUNT(CASE WHEN message.read = 0 THEN 1 ELSE NULL END) as totalMessage')
  .orderBy("message.id","ASC")
  .limit(1)
  .getRawOne();
}

const getUsersTypeBrigadista = async (): Promise<any> => {
  return await getRepository(Users).find({where:{typeUser:3}});
};


const readmessagePatient = async(data:{
  sender:number, 
  receive:number
}):Promise<any> =>{
  const {sender, receive} = data;
  let result = await getConnection().createQueryBuilder()
  .update(Message)
  .set({ read: true })
  .where("senderId = :sender", { sender: sender })
  .andWhere("receiverId = :receive", { receive: receive })
  .andWhere("state = 's'")
  .execute();
  if(result != undefined){
    return true
  }else{
    return false
  }
}

const readmessageDoctor = async(data:{
  sender:number, 
  receive:number
}):Promise<any> =>{
  const {sender, receive} = data;
  let result = await getConnection().createQueryBuilder()
  .update(Message)
  .set({ read: true })
  .where("senderId = :sender", { sender: sender })
  .andWhere("receiverId = :receive", { receive: receive })
  .andWhere("state = 'r'")
  .execute();
  if(result != undefined){
    return true
  }else{
    return false
  }

}

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
              .orderBy("message.id", 'ASC')
              .getMany()
              
                

}

const addMessages = async(username:string,message:string, roomName:any, state:string):Promise<any> => {
  const room = roomName.split(",")
  let tokens:any = [];
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
      tokens.push(sendMessage.token)
    } 
  }
  sendFCM(`Nuevo mensaje de ${username}`,message, tokens)
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
      console.log(resp, 'exito')
      return true;
    }else{
      return false;
    }
  }).catch((error) => {
      console.log(`error ${error}`);
  });
}


export {totalMessage, getUserDoctors, getUsers, getUser, getUsersTypeBrigadista, getOnlyUser, addMessages, getMessages, getUserLike, readmessageDoctor, readmessagePatient};