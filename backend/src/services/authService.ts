import jwt from 'jsonwebtoken';
import {signupRepo, loginRepo, saveTokenRepo} from '../repositories/authRepository';
import {SignupRequest, LoginRequest, AuthResponse} from '../types';


const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_123456789';

export const signupService = async (data: SignupRequest) : Promise<AuthResponse> => {

    const user = await signupRepo(data);

    const token = jwt.sign(
        {user_id: user.user_id, role: user.role},
        JWT_SECRET,
        {
            expiresIn: '7d'
        } 
    );

    await saveTokenRepo(user.user_id, token);

    return {
        success: true,
        message: 'User registered successfully',
        token,
        user
    };
};

export const loginService = async (data: LoginRequest) : Promise<AuthResponse> => {
    const user = await loginRepo(data);
    if (!user) {
       throw new Error('Invalid credentials');
    }
    const token = jwt.sign(
        {user_id: user.user_id, role: user.role},
        JWT_SECRET,
        {
            expiresIn: '7d'
        } 
    );
    await saveTokenRepo(user.user_id, token);
    return {
        success: true,
        message: 'User logged in successfully',
        token,
        user
    };
};
