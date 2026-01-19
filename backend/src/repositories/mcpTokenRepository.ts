import { pool } from '../config/config'; 

export const updateApiKey = async (userId: number, apiKey: string): Promise<boolean> => {
  try {
    const query = "UPDATE users SET api_key = ? WHERE user_id = ?";
    const [result]: any = await pool.execute(query, [apiKey, userId]);
    
    // Check if any row was actually updated
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Repository Error (updateApiKey):", error);
    throw new Error("Database failed to update API key");
  }
};