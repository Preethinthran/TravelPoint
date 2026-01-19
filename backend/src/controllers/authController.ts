import { Request, Response} from 'express';
import {signupService, loginService} from '../services/authService';

export const signup = async (req:Request, res:Response) => {
    try{
        const result = await signupService(req.body);
        return res.status(201).json(result);

    }catch(error: any){
        console.error("Signup Error:", error);

        if (error.meta?.code == '1062' || error.message?.includes('Duplicate entry')){
            return res.status(409).json({
                success: false,
                message: 'Email Already Exists'
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error during SignUp'
        });
    }
};

export const login = async(req: Request, res: Response) =>{
    try{
        const result = await loginService(req.body);

        return res.status(200).json(result);
    }catch(error: any){
        console.error("Login Error:", error);
        
        if(error.message === "Invalid credentials"){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error during Login'
        });
    }
};