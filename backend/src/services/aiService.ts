import { HfInference } from "@huggingface/inference";
import { bookingTools } from "./bookingTools"; 
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

const SYSTEM_INSTRUCTION = `
You are the Travel Point AI Assistant.
TOOLS AVAILABLE:
1. book_ticket(tripId, passengerId, pickupId, dropId, amount)
2. get_booking_details(bookingId)
3. search_trips(query) - Use this ONLY for finding new buses.
4. cancel_booking(bookingId) - Use this matches "cancel", "refund", or "drop" for a specific ticket.

CRITICAL RULES:
- If the user says "Cancel ticket 4", you MUST use "cancel_booking". Do NOT use search.
- To use a tool, reply ONLY with JSON: { "tool": "tool_name", "args": { ... } }
- If the output is not JSON, just talk normally.
- Just provide the answer directly to the user like a human agent would.
`;

/**
 * Helper to strip markdown and find the JSON object
 */
const cleanJson = (text: string): string => {
    // Remove markdown code blocks if present
    let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    // Find the first '{' and last '}'
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        return clean.substring(start, end + 1);
    }
    return clean;
};

export const generateAIResponse = async (userMessage: string, userId: number = 1) => {
    // 1. Try Meta Llama 3 first (Smarter), then Phi-3 (Backup)
    const models = ['meta-llama/Meta-Llama-3-8B-Instruct', 'microsoft/Phi-3-mini-4k-instruct'];

    for (const model of models) {
        try {
            // A. Initial Request
            const response = await hf.chatCompletion({
                model: model,
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 300,
                temperature: 0.1 // Low temp = strict logic
            });

            const content = response.choices[0]?.message?.content || "";

            // B. Check for Tool Call (Robust Regex)
            if (content.match(/\{\s*"tool"\s*:/)) {
                console.log(`🛠️ AI (${model}) wants to use a tool...`);
                
                try {
                    // CLEAN the JSON before parsing (Fixes the error you saw)
                    const jsonStr = cleanJson(content);
                    const toolCall = JSON.parse(jsonStr);
                    let toolResult = "";

                    console.log("Tool Selected:", toolCall.tool);

                    // Execute Logic
                    if (toolCall.tool === "search_trips") {
                         toolResult = await bookingTools.searchTrips(toolCall.args.query);
                    }
                    else if (toolCall.tool === "get_booking_details") {
                        toolResult = await bookingTools.getBookingDetails(toolCall.args.bookingId);
                    } 
                    else if (toolCall.tool === "cancel_booking") {
                        toolResult = await bookingTools.cancelTicket(toolCall.args.bookingId);
                    }
                    else if (toolCall.tool === "book_ticket") {
                        toolResult = await bookingTools.bookTicket(
                            toolCall.args.tripId,
                            userId,
                            toolCall.args.pickupId,
                            toolCall.args.dropId,
                            toolCall.args.amount
                        );
                    }

                    // C. Feed result back to AI
                    const finalResponse = await hf.chatCompletion({
                        model: model,
                        messages: [
                            { role: "system", content: SYSTEM_INSTRUCTION },
                            { role: "user", content: userMessage },
                            { role: "assistant", content: jsonStr }, 
                            { role: "user", content: `Tool Output: ${toolResult}. Please tell me what you did.` }
                        ],
                        max_tokens: 300
                    });

                    return finalResponse.choices[0]?.message?.content;

                } catch (e) {
                    console.error("❌ Tool Processing Error:", e);
                    // FALLBACK: Don't show JSON to user. Show a polite error.
                    return "I attempted to process your request, but I encountered a technical issue. Please try again.";
                }
            }

            return content; 

        } catch (error) {
            console.warn(`Retry ${model}...`);
        }
    }
    return "I am currently experiencing high traffic. Please try again later.";
};