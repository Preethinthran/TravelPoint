import crypto from 'crypto';
import * as mcpTokenRepository from '../repositories/mcpTokenRepository';

export const generateAndSaveApiKey = async (userId: number): Promise<string> => {
  // 1. Calculate Expiration (7 Days from now)
  const date = new Date();
  date.setDate(date.getDate() + 7); 
  const expiryTimestamp = Math.floor(date.getTime() / 1000); // Convert to Unix Timestamp (seconds)

  // 2. Generate Random String
  const randomString = crypto.randomBytes(16).toString('hex');

  // 3. Create the "Smart Key"
  // Format: trv_<timestamp>_<random>
  const newApiKey = `trv_${expiryTimestamp}_${randomString}`;

  // 4. Save the WHOLE string to the existing api_key column
  // (No DB change needed, just updating the string value)
  await mcpTokenRepository.updateApiKey(userId, newApiKey);

  return newApiKey;
};