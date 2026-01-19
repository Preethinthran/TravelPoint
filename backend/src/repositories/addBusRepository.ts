import { prisma } from "../prisma";
import { BusRequest } from "../types"; 

export const createBusRepo = async (data: BusRequest) => {
    
    const existingBus = await prisma.$queryRaw`SELECT * FROM bus WHERE bus_number = ${data.bus_number}`;
    if ((existingBus as any[]).length > 0) {
        throw new Error("Bus Number already exists");
    }

    // 2. Transaction: Create Bus -> Generate Seats
    // We use a transaction so if seat generation fails, the bus is NOT created.
    const newBus = await prisma.$transaction(async (tx) => {
        
        await tx.$executeRaw`
            INSERT INTO bus (bus_number, operator_id, total_seats, bus_type, rating, total_ratings)
            VALUES (${data.bus_number}, ${data.operator_id}, ${data.total_seats}, ${data.bus_type}, 0, 0)
        `;

        const busResult = await tx.$queryRaw<{bus_id: number}[]>`
            SELECT bus_id FROM bus WHERE bus_number = ${data.bus_number}
        `;
        const busId = busResult[0].bus_id;

       
        let defaultSeatType = 'Seater';
        if (data.bus_type.toLowerCase().includes('sleeper')) {
            defaultSeatType = 'Sleeper_Lower';
        }

        for (let i = 1; i <= data.total_seats; i++) {
            const seatNumber = `S${i}`; 
            
            await tx.$executeRaw`
                INSERT INTO seat (bus_id, seat_number, seat_type, price, status) 
                VALUES (${busId}, ${seatNumber}, ${defaultSeatType}, 0.00, 'good')
            `;
        }

        return { ...data, bus_id: busId };
    });

    return newBus;
};

export const getBusOwnerRepo = async (busId: number) => {
    const result = await prisma.$queryRaw<{operator_id: number}[]>`
        SELECT operator_id FROM bus WHERE bus_id = ${busId}
    `;
    return result[0] || null;
};

// src/repositories/addBusRepository.ts

export const getBusesByOperatorRepo = async (operatorId: number) => {
    return await prisma.$queryRaw`
        SELECT * FROM bus 
        WHERE operator_id = ${operatorId}
        ORDER BY bus_id DESC
    `;
};