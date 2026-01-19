import { prisma } from "../prisma";
import { RouteRequest } from "../types";

// 1. Create a New Route with Stops
export const createRouteRepo = async (operatorId: number, data: RouteRequest) => {
    return await prisma.$transaction(async (tx) => {
        
        // A. Insert the Route (Path)
        await tx.$executeRaw`
            INSERT INTO route (route_name, operator_id, total_distance, estimated_time)
            VALUES (${data.route_name}, ${operatorId}, ${data.total_distance}, ${data.estimated_time})
        `;
        
        const lastIdResult = await tx.$queryRaw<{id: number}[]>`
            SELECT LAST_INSERT_ID() as id
        `;
        const newPathId = Number(lastIdResult[0].id);

        for (const stop of data.stops) {
            await tx.$executeRaw`
                INSERT INTO stops (
                    path_id, stop_name, order_id, distance, 
                    price, estimated_time, stop_type
                )
                VALUES (
                    ${newPathId}, ${stop.stop_name}, ${stop.order_id}, ${stop.distance}, 
                    ${stop.price}, ${stop.estimated_time}, ${stop.stop_type}
                )
            `;
        }

        return { path_id: newPathId, message: "Route and stops created successfully" };
    });
};

export const getRoutesByOperatorRepo = async (operatorId: number) => {
    const routes = await prisma.$queryRaw`
        SELECT * FROM route WHERE operator_id = ${operatorId}
    `;
    return routes;
};