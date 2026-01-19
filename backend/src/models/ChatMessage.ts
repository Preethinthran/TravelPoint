import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the Interface (Type)
export interface IChatMessage extends Document {
    booking_id: number;    
    sender_role: string;  
    message: string;
    created_at: Date;
    is_read: boolean;
}

// 2. Define the Schema (Structure)
const ChatMessageSchema: Schema = new Schema({
    booking_id: { type: Number, required: true, index: true }, // Index for fast lookup
    sender_role: { type: String, required: true, enum: ['passenger', 'operator'] },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);