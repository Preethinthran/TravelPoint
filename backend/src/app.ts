import express from "express";
import http from "http"; 
import { Server } from "socket.io"; 
import cors from 'cors';
import operatorRoutes from "./routes/operatorRoutes";
import searchRoutes from "./routes/searchBuses";
import layoutRoutes from "./routes/layoutRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import seatRoutes from "./routes/busOperatorRoutes";
import travellerRoutes from "./routes/travellerRoutes";
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import connectMongoDB from './config/mongoConfig';
import { setupSocketIO } from './sockets/socketHandler';
import aiRoutes from './routes/aiRoutes';

const app = express();

connectMongoDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", operatorRoutes);
app.use('/api/user', travellerRoutes);
app.use("/api", searchRoutes);
app.use("/api/trips", layoutRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api/operator', seatRoutes);
app.use('/api/ai', aiRoutes);

// Swagger
const swaggerDocument = yaml.load(path.join(__dirname, './docs/openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// 1. Create a raw HTTP server passing the Express App
const server = http.createServer(app); 

// 2. Initialize Socket.io on this HTTP server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Match your frontend URL
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

setupSocketIO(io);

server.listen(PORT, () => {
    console.log(`Server + WebSocket running on port ${PORT}`);
    console.log(`Swagger Docs : http://localhost:${PORT}/api-docs`);
});