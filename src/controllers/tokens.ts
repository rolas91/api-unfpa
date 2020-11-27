import {getRepository} from 'typeorm';
import jsonwebtoken from 'jsonwebtoken';
import RefreshToken from '../entity/Tokens';

const JWT_EXPIRES_IN = 60 * 60; // 1 hours in seconds

export default {
  refresh: async (jwt: string): Promise<any> => {
    if (!jwt) {
      console.log('refreshToken', 'el jwt ingresado es nulo');
    }
    // const refreshToken = await RefreshToken.findOne({ jwt });
    const refreshToken = await getRepository(RefreshToken).findOne({where:{jwt:jwt}})
    if (!refreshToken) {
      throw new Error('403');
    }

    const { payload } = refreshToken;

    console.log(payload);
    

    const newJwt = await jsonwebtoken.sign(payload.toString(), process.env.SECRET!, {
      expiresIn: JWT_EXPIRES_IN
    });

    // updated the refreshToken
    getRepository(RefreshToken).merge(refreshToken, {jwt:newJwt});
    await getRepository(RefreshToken).save(refreshToken);
    // refreshToken.jwt = newJwt;
    // await refreshToken.save();
    //console.log('refreshToken new', refreshToken);
    return {
      token: newJwt,
      expiresIn: JWT_EXPIRES_IN,
      unit: 'seconds'
    };
  },

  newRefreshToken: async (jwt: string, payload: any): Promise<void> => {
    // create a new refreshToken
    // await new RefreshToken({
    //   payload,
    //   jwt
    // }).save();
  
    let newToken = getRepository(RefreshToken).create({
      jwt:jwt,
      payload:payload.id
    });    
    await getRepository(RefreshToken).save(newToken);
  }
};
