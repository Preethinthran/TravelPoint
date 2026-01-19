import { Request, Response } from 'express';
import { addOperatorService , getOperatorsService} from '../services/adminService';

export const addOperator = async (req: Request, res: Response) => {
    try {
        const result = await addOperatorService(req.body);
        return res.status(201).json(result);

    } catch (error: any) {
        console.error("Add Operator Error:", error);
        
        // Handle Duplicate Email (MySQL Error 1062)
        if (error.meta?.code === '1062' || error.message?.includes('Duplicate entry')) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getOperators = async (req: Request, res: Response) => {
    try {
        const result = await getOperatorsService();
        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Get Operators Error:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};