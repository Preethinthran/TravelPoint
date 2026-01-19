import {prisma} from "../prisma";
import {SignupRequest} from "../types";
import crypto from 'crypto';

const hashPassword = (password: string):string =>{
    return crypto.createHash('sha256').update(password).digest('hex');
}

export const addOperatorRepo = async (data:SignupRequest) =>{
    const hasehedPassword = hashPassword(data.password);
    await prisma.$executeRaw`
    insert into users (name, email, phone, password, role,last_login)
    values (
        ${data.name},
        ${data.email},
        ${data.phone},
        ${hasehedPassword},
        'operator',
        NOW()
    )
    `;

    const newOperator = await prisma.$queryRaw<{user_id: number, name: string, email:string, role:string}[]>`
    select user_id, name, email, role
    from users
    where email = ${data.email}
    `;
    return newOperator[0];
}

export const getOperatorsRepo = async () => {
    const operators = await prisma.$queryRaw<{user_id: number, name: string, email:string}[]>`
    select user_id, name, email
    from users
    where role = 'operator'
    `;
    return operators;
}