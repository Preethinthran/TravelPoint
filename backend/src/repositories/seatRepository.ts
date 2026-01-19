import {prisma} from "../prisma";
import {Prisma} from "@prisma/client";
import { SeatUpdateGroup } from "../types";

export const updateSeatLayoutRepo = async (busId: number, updates: SeatUpdateGroup[]) => {
    return await prisma.$transaction(async (tx) => {
      for (const group of updates){
        const setClauses : Prisma.Sql[] = [];

        if (group.price !== undefined) setClauses.push(Prisma.sql`price = ${group.price}`);
        if (group.seat_type !== undefined) setClauses.push(Prisma.sql`seat_type = ${group.seat_type}`);
        if (group.status !== undefined) setClauses.push(Prisma.sql`status = ${group.status}`);
      
    if (setClauses.length === 0) continue;  
    
    await tx.$executeRaw`
      UPDATE seat
      SET ${Prisma.join(setClauses,',')}
      WHERE bus_id = ${busId}
      AND seat_number IN (${Prisma.join(group.seat_numbers)})
    `;
      
      };
    });
};

export const getSeatsByBusIdRepo = async (busId: number) => {
    const seats = await prisma.$queryRaw`
      Select * from seat
      where bus_id = ${busId}
      order by seat_id asc`;

      return seats as any[];
};