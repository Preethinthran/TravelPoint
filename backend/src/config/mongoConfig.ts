import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined in .env file');
        }
        
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected (Chat Storage)');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        throw error; // Re-throw to prevent app from starting with failed DB connection
    }
};

export default connectMongoDB;