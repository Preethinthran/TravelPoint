import {prisma} from "../prisma";
import {SignupRequest, LoginRequest } from "../types";
import crypto from 'crypto';

const hashPassword = (password: string):string =>{
    return crypto.createHash('sha256').update(password).digest('hex');
}


export const signupRepo = async (data:SignupRequest) =>{

    const hashedPassword = hashPassword(data.password);

    await prisma.$executeRaw`
      insert into users (name, email, phone, password, last_login)
      values (
        ${data.name},
        ${data.email},
        ${data.phone},
        ${hashedPassword},
        NOW()
      )
    `;

    const newUser = await prisma.$queryRaw<{user_id: number, name: string, email:string, role:string}[]>`
    select user_id, name, email, role
    from users
    where email = ${data.email}
    `;
    return newUser[0];
};

export const loginRepo = async (data: LoginRequest) => {

    const inputPassword = hashPassword(data.password);

    const users = await prisma.$queryRaw<{user_id: number,name: string, email: string, role: string}[]>`
      select user_id, name, email, role
      from users
      where email = ${data.email}
      and password = ${inputPassword}
    `;


    return users[0] || null;
};

export const saveTokenRepo = async (userId: number,token : string) => {
    await prisma.$executeRaw`
         update users
         set token = ${token}, last_login = NOW()
         where user_id = ${userId}
    `;

};
