import { HfInference } from "@huggingface/inference";
import { bookingTools } from "./bookingTools";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// --- MCP CLIENT SETUP ---
let mcpClient: Client | null = null;
let mcpToolsOrchestration: any[] = [];

async function connectToMcpServer() {
    if (mcpClient) return mcpClient;
    try {
        const transport = new StdioClientTransport({
            command: "npx",
            args: ["-y", "mcp-google-calendar"]
        });
        const client = new Client({ name: "TravelPoint-Client", version: "1.0.0" }, { capabilities: {} });

        // Add timeout to prevent hanging if server awaits auth
        const connectionPromise = client.connect(transport);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("MCP Connection Timed Out - Check if credentials.json is missing")), 5000)
        );

        await Promise.race([connectionPromise, timeoutPromise]);

        mcpClient = client;
        const result = await client.listTools();
        mcpToolsOrchestration = result.tools;
        console.log(`✅ MCP Connected. Tools found: ${result.tools.length}`);
    } catch (e: any) {
        console.error("❌ MCP Connection Failed (Non-fatal):", e.message);
        console.warn("ℹ️  Note: mcp-google-calendar requires a credentials.json file/env var to function.");
    }
}

const SYSTEM_INSTRUCTION = `You are the Travel Point AI Assistant. You help users with bus bookings.

<tools>
  <tool name="get_booking_details">
    <description>Get status and details of a specific booking</description>
    <parameters>
      <parameter name="bookingId" type="number" required="true">The booking ID to check</parameter>
    </parameters>
  </tool>
  
  <tool name="search_trips">
    <description>Search for available bus trips</description>
    <parameters>
      <parameter name="query" type="string" required="true">Search query with city names or bus type</parameter>
    </parameters>
  </tool>
  
  <tool name="cancel_booking">
    <description>Cancel a booking and process refund</description>
    <parameters>
      <parameter name="bookingId" type="number" required="true">The booking ID to cancel</parameter>
    </parameters>
  </tool>
  
  <tool name="book_ticket">
    <description>Book a new ticket</description>
    <parameters>
      <parameter name="tripId" type="number" required="true">Trip ID to book</parameter>
      <parameter name="pickupId" type="number" required="true">Pickup stop ID</parameter>
      <parameter name="dropId" type="number" required="true">Drop stop ID</parameter>
      <parameter name="amount" type="number" required="true">Amount to pay</parameter>
    </parameters>
  </tool>
</tools>

<instructions>
CRITICAL RULES:
1. When user requests booking info, use "get_booking_details" tool
2. When user wants to search buses, use "search_trips" tool
3. When user wants to cancel/refund, use "cancel_booking" tool
4. When user wants to book a ticket, use "book_ticket" tool

To call a tool, reply with ONLY valid JSON in this EXACT format:
{"tool": "tool_name", "args": {"paramName": value}}

If the user is just chatting (hello, thanks, etc), reply normally without JSON.
</instructions>
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
    // 1. Ensure MCP Connection
    await connectToMcpServer();

    // 2. Prepare dynamic instruction
    let currentInstructions = SYSTEM_INSTRUCTION;

    if (mcpToolsOrchestration.length > 0) {
        currentInstructions += "\n<external_mcp_tools>\n";
        mcpToolsOrchestration.forEach((t: any) => {
            currentInstructions += `  <tool name="${t.name}">\n`;
            currentInstructions += `    <description>${t.description}</description>\n`;
            // Simplify params for demo
            currentInstructions += `    <parameters>${Object.keys(t.inputSchema?.properties || {}).join(", ")}</parameters>\n`;
            currentInstructions += `  </tool>\n`;
        });
        currentInstructions += "</external_mcp_tools>\n";
    }

    // 3. Try Meta Llama 3 first (Smarter), then Phi-3 (Backup)
    const models = ['meta-llama/Meta-Llama-3-8B-Instruct', 'microsoft/Phi-3-mini-4k-instruct'];

    for (const model of models) {
        try {
            // A. Initial Request
            const response = await hf.chatCompletion({
                model: model,
                messages: [
                    { role: "system", content: currentInstructions },
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
                    // --- MCP TOOLS DELEGATION ---
                    else if (mcpClient && mcpToolsOrchestration.some((t: any) => t.name === toolCall.tool)) {
                        console.log(`📡 Calling MCP Tool: ${toolCall.tool}`);
                        try {
                            const mcpRes = await mcpClient.callTool({
                                name: toolCall.tool,
                                arguments: toolCall.args
                            });
                            toolResult = JSON.stringify(mcpRes);
                        } catch (err: any) {
                            toolResult = "Error calling MCP tool: " + err.message;
                        }
                    }

                    // C. Feed result back to AI
                    const finalResponse = await hf.chatCompletion({
                        model: model,
                        messages: [
                            { role: "system", content: currentInstructions },
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