import mongoose from 'mongoose';

const connectMongoDB = async () => {
    try {
        const MONGO_URI = 'mongodb://localhost:27017/bus_chat_db'; 
        
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected (Chat Storage)');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
    }
};

export default connectMongoDB;