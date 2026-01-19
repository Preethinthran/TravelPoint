import { createRouteRepo, getRoutesByOperatorRepo } from "../repositories/routeRepository";
import { RouteRequest } from "../types";

export const createRouteService = async (operatorId: number, data: RouteRequest) => {
    
    if (!data.stops || data.stops.length === 0) {
        throw new Error("A route must have at least one stop.");
    }

    const result = await createRouteRepo(operatorId, data);
    
    return {
        success: true,
        message: result.message,
        path_id: result.path_id
    };
};

export const getMyRoutesService = async (operatorId: number) => {
    const routes = await getRoutesByOperatorRepo(operatorId);
    
    return {
        success: true,
        data: routes
    };
};