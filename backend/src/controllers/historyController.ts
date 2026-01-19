import {Request, Response} from 'express';
import { getUserHistoryService } from '../services/historyService';

export const getUserHistoryController = async (req: Request, res: Response) =>{
    try{
        const userId = parseInt(req.params.user_id);
        if (isNaN(userId)){
            return res.status(400).json({
                success: false,
                error: "Invalid Request",
                message: "User Id must be a number"
            });
        }

        const history = await getUserHistoryService(userId);

        return res.status(200).json({
            success: true,
            data: history
        });
    }catch(error){
        console.error("Error in fetching history: ",error);
        return res.status(500).json({
            success: false,
            error:" Internal Server Error",
            message: "Something went Wrong"
        });
    }
};