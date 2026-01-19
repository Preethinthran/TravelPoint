import { addOperatorRepo, getOperatorsRepo } from "../repositories/adminRepository";
import { SignupRequest } from "../types";

export const addOperatorService = async (data: SignupRequest) => {
    const operator = await addOperatorRepo(data);
    
    return {
        success: true,
        message: 'Operator created successfully',
        operator
    };
};

export const getOperatorsService = async () => {
    const operators = await getOperatorsRepo();
    return {
        success: true,
        data: operators
    };
};