import { HfInference } from "@huggingface/inference";
import { bookingTools } from "./bookingTools";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// --- MCP CLIENT SETUP ---
// Map of server name -> Client instance
const mcpClients: Map<string, Client> = new Map();
// Map of tool name -> Client instance (for routing)
const toolToClientMap: Map<string, Client> = new Map();
let mcpToolsOrchestration: any[] = [];

// Resolve the absolute path to the OAuth credentials file
const OAUTH_CREDENTIALS_PATH = path.resolve(__dirname, "../../gcp-oauth.keys.json");
console.log("📍 OAuth Credentials Path:", OAUTH_CREDENTIALS_PATH);
console.log("📍 File exists:", require('fs').existsSync(OAUTH_CREDENTIALS_PATH));

const MCP_SERVERS_CONFIG = [
    {
        name: "google-calendar",
        command: "npx",
        args: ["-y", "@cocal/google-calendar-mcp"],
        env: {
            GOOGLE_OAUTH_CREDENTIALS: process.env.GOOGLE_OAUTH_CREDENTIALS || OAUTH_CREDENTIALS_PATH
        }
    },
    {
        name: "google-sheets",
        command: "npx",
        args: ["ts-node", "src/mcp-sheets/index.ts"],
        env: {
            GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID || "travelpoint-mcp",
            GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT || path.resolve(__dirname, "../../service-account-sheets.json")
        }
    }
];

async function connectToMcpServers() {
    if (mcpClients.size > 0) return; // Already connected

    console.log("🔗 Connecting to MCP Servers...");
    mcpToolsOrchestration = [];
    toolToClientMap.clear();

    for (const serverConfig of MCP_SERVERS_CONFIG) {
        try {
            console.log(`   - Connecting to ${serverConfig.name}...`);

            // Filter out undefined environment variables
            const cleanEnv: Record<string, string> = {};
            for (const [key, value] of Object.entries(process.env)) {
                if (value !== undefined) {
                    cleanEnv[key] = value;
                }
            }

            // Filter server-specific env vars to remove undefined values
            const serverEnv: Record<string, string> = {};
            for (const [key, value] of Object.entries(serverConfig.env)) {
                if (value !== undefined) {
                    serverEnv[key] = value;
                }
            }

            // Merge with server-specific env vars
            const finalEnv = {
                ...cleanEnv,
                ...serverEnv
            };

            console.log(`     📍 Using credentials: ${finalEnv.GOOGLE_OAUTH_CREDENTIALS || finalEnv.GOOGLE_APPLICATION_CREDENTIALS || '(not set)'}`);

            const transport = new StdioClientTransport({
                command: serverConfig.command,
                args: serverConfig.args,
                env: finalEnv as Record<string, string>,
                stderr: 'pipe' // Capture stderr for debugging
            });

            const client = new Client(
                { name: `TravelPoint-${serverConfig.name}`, version: "1.0.0" },
                { capabilities: {} }
            );

            // Capture stderr output for debugging
            if ((transport as any).process?.stderr) {
                (transport as any).process.stderr.on('data', (data: Buffer) => {
                    const errorMsg = data.toString();
                    if (errorMsg.includes('Error') || errorMsg.includes('error')) {
                        console.error(`     🔴 ${serverConfig.name} stderr:`, errorMsg.trim());
                    }
                });
            }

            // Add timeout for connection
            const connectionPromise = client.connect(transport);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Connection to ${serverConfig.name} Timed Out`)), 30000)
            );

            await Promise.race([connectionPromise, timeoutPromise]);

            mcpClients.set(serverConfig.name, client);

            // List tools for this server
            const result = await client.listTools();
            console.log(`     ✅ Connected to ${serverConfig.name}. Tools: ${result.tools.map(t => t.name).join(', ')}`);

            // Register tools
            for (const tool of result.tools) {
                mcpToolsOrchestration.push(tool);
                toolToClientMap.set(tool.name, client);
            }

        } catch (error: any) {
            console.error(`     ❌ Failed to connect to ${serverConfig.name}:`, error.message);
            // Non-fatal, continue to next server
        }
    }

    // Add fallback tools if Calendar failed specifically (legacy fallback)
    if (!mcpClients.has("google-calendar")) {
        console.warn("⚠️ Google Calendar missing, adding fallback definitions.");
        const fallbacks = [
            {
                name: "create-event",
                description: "Create a new event in Google Calendar (Offline/Fallback)",
                inputSchema: {
                    type: "object",
                    properties: {
                        calendarId: { type: "string", description: "Calendar ID ('primary')" },
                        summary: { type: "string" },
                        start: { type: "string" },
                        end: { type: "string" }
                    },
                    required: ["calendarId", "summary", "start", "end"]
                }
            }
        ];
        // Only add if not strictly conflicting, mainly for UI hints
        // mcpToolsOrchestration.push(...fallbacks);
    }

    console.log(`✅ MCP Initialization Complete. Total Tools: ${mcpToolsOrchestration.length}`);
}

// Initialize MCP connection when module loads
// Initialize MCP servers when module loads
connectToMcpServers().catch(err => {
    console.warn('⚠️ MCP initialization failed (non-fatal):', err.message);
});

const SYSTEM_INSTRUCTION_BASE = `You are the Travel Point AI Assistant. You help users with bus bookings and calendar management.

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

// Dynamic system instruction builder
function buildSystemInstruction(): string {
    const now = new Date();
    // Inject current time so AI knows "today", "tomorrow"
    // EXPLICITLY state the year to prevent AI using training data year (e.g. 2024)
    const humanDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let instruction = `Current System Time: ${now.toISOString()}
TODAY IS: ${humanDate}
IMPORTANT: The current year is ${now.getFullYear()}. Do NOT use 2023, 2024 or 2025.\n` + SYSTEM_INSTRUCTION_BASE;

    // Dynamically add Google Calendar tools if available
    if (mcpToolsOrchestration.length > 0) {
        for (const tool of mcpToolsOrchestration) {
            instruction += `  <tool name="${tool.name}">
    <description>${tool.description}</description>
    <parameters>
`;
            // Add parameters from tool schema
            if (tool.inputSchema?.properties) {
                for (const [paramName, paramSchema] of Object.entries(tool.inputSchema.properties)) {
                    const schema = paramSchema as any;
                    const required = tool.inputSchema.required?.includes(paramName) || false;
                    instruction += `      <parameter name="${paramName}" type="${schema.type || 'string'}" required="${required}">${schema.description || ''}</parameter>
`;
                }
            }
            instruction += `    </parameters>
  </tool>
`;
        }
    }

    instruction += `</tools>

<instructions>
CRITICAL RULES:
1. When user requests booking info, use "get_booking_details" tool
2. When user wants to search buses, use "search_trips" tool
3. When user wants to cancel/refund, use "cancel_booking" tool
4. When user wants to book a ticket, use "book_ticket" tool
5. When user wants calendar operations, use the appropriate Google Calendar tool
6. ERROR HANDLING: If a tool fails (e.g. "account not found"), report the error to the user exactly. DO NOT invent new tools like "manage-accounts".
7. ACCOUNT MANAGEMENT: You CANNOT create/add accounts in chat. Tell the user to run "npx @cocal/google-calendar-mcp auth" in their terminal.

CALENDAR TOOL RULES (STRICT):
- For "create-event", do NOT use a nested 'event' object. Place summary, description, start, and end directly in the top-level arguments alongside calendarId.
- ALWAYS use 'primary' as the calendarId unless specified otherwise.
- Use 'personal' as the default account nickname, but allow others (e.g. 'work', 'normal') if specified.

- Start/End times MUST be plain strings (ISO format), NOT objects.

To call a tool, reply with ONLY valid JSON in this EXACT format:
{"tool": "tool_name", "args": {"paramName": value}}

If the user is just chatting (hello, thanks, etc), reply normally without JSON.

GOOGLE SHEETS TOOL RULES (STRICT):
- 🛑 DO NOT USE "sheets_batch_update_values" for adding rows. It is too complex.
- ✅ USE "sheets_append_values" to add data.

- For "sheets_create_spreadsheet": 
  * Required: "title" (string)
  * Optional: "headers" (array of strings)
  * Example: {"tool": "sheets_create_spreadsheet", "args": {"title": "My Sheet", "headers": ["Name", "Email", "Phone"]}}

- For "sheets_append_values":
  * Required: "spreadsheetId" (string) - MUST be the EXACT ID from the user's URL. (e.g. "1wUB..."). DO NOT GUESS.
  * Required: "range" (string) - usually "Sheet1!A1"
  * Required: "values" (2D Array) - MUST be an Array of Arrays.
  * ❌ WRONG: "[...]" (Stringified JSON)
  * ❌ WRONG: [{"name": "John"}] (Array of Objects)
  * ✅ RIGHT: [["John", "john@email.com"], ["Jane", "jane@email.com"]]
  * Example: {"tool": "sheets_append_values", "args": {"spreadsheetId": "1wUB...", "range": "Sheet1!A1", "values": [["Chennai Express", "330", "6h 30m"], ["Kovai Express", "400", "7h"]]}}

OUTPUT FORMAT RULES (STRICT):
1. For CREATED events, return ONLY this format (Use DOUBLE newlines):
   "✅ Event Created: [Summary]

   📅 Time: [DD/MM/YYYY HH:MM AM/PM] - [End Time]

   (Optional) 📝 [Description]"

2. For LISTING events, return ONLY this format (Use DOUBLE newlines between items):
   "📅 Your Schedule:

   - [Summary] ([DD/MM/YYYY HH:MM AM/PM] - [End Time])

   - [Summary] ([DD/MM/YYYY HH:MM AM/PM] - [End Time])"

3. NEVER explain the technical steps.
4. IMPORTANT: Convert ISO dates to DD/MM/YYYY.
5. IMPORTANT: Ensure there are blank lines between items.
</instructions>
`;

    return instruction;
}

/**
 * Helper to strip markdown and find the JSON object
 */
const extractJson = (text: string): string | null => {
    // Remove markdown code blocks and extra whitespace
    let clean = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/[\x00-\x1F\x7F]/g, "")
        .trim();

    console.log("🔍 Cleaned text (last 100 chars):", clean.substring(Math.max(0, clean.length - 100)));

    // Strategy: Search backwards for the last valid JSON object
    // 1. Find all closing braces '}'
    const closingIndices: number[] = [];
    for (let i = clean.length - 1; i >= 0; i--) {
        if (clean[i] === '}') closingIndices.push(i);
    }

    // 2. For each closing brace (starting from the very last one), try to find a matching opening brace
    for (const closeIdx of closingIndices) {
        let balance = 0;
        for (let i = closeIdx; i >= 0; i--) {
            const char = clean[i];
            if (char === '}') balance++;
            if (char === '{') balance--;

            if (balance === 0) {
                // Found a balanced block `candidate`
                const candidate = clean.substring(i, closeIdx + 1);
                try {
                    const parsed = JSON.parse(candidate);
                    // Basic heuristic: it should be an object with "tool" property
                    if (parsed && typeof parsed === 'object' && parsed.tool) {
                        console.log("📦 Extracted JSON:", candidate);
                        return candidate;
                    }
                } catch (e) {
                    // Not valid JSON, continue searching
                }
            }
        }
    }

    return null;
};

export const generateAIResponse = async (userMessage: string, userId: number = 1) => {
    console.log("🟢 generateAIResponse called with:", userMessage);

    // Use better models trained for instruction following and function calling
    const models = [
        'mistralai/Mixtral-8x7B-Instruct-v0.1',    // Excellent at JSON format
        'NousResearch/Hermes-2-Pro-Mistral-7B',    // Trained for function calling
        'meta-llama/Meta-Llama-3-8B-Instruct'      // Fallback
    ];

    let lastError = null;

    for (const model of models) {
        try {
            console.log(`🤖 Trying model: ${model}`);

            // A. Initial Request with enhanced prompt
            // Define validation helper if not imported
            const isValidToolCall = (obj: any): boolean => {
                return obj && typeof obj.tool === "string" && obj.args && typeof obj.args === "object";
            };

            const response = await hf.chatCompletion({
                model: model,
                messages: [
                    { role: "system", content: buildSystemInstruction() },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 300,
                temperature: 0.1 // Low temp = strict logic
            });

            const content = response.choices[0]?.message?.content || "";
            console.log(`📝 Model response: ${content}`);

            // B. Check for Tool Call with improved detection
            const jsonStr = extractJson(content);

            if (jsonStr) {
                console.log(`🛠️ Detected potential tool call`);

                try {
                    // CLEAN the JSON before parsing
                    const toolCall = JSON.parse(jsonStr);

                    // Validate the tool call structure
                    if (!isValidToolCall(toolCall)) {
                        console.warn("⚠️ Invalid tool call structure, treating as normal response");
                        return content;
                    }

                    let toolResult = "";
                    console.log(`✅ Valid tool call: ${toolCall.tool}`);

                    // C. Execute the appropriate tool
                    switch (toolCall.tool) {
                        case "search_trips":
                            toolResult = await bookingTools.searchTrips(toolCall.args.query);
                            break;

                        case "get_booking_details":
                            const bookingId = parseInt(toolCall.args.bookingId);
                            if (isNaN(bookingId)) {
                                return "I need a valid booking ID number to check the status.";
                            }
                            toolResult = await bookingTools.getBookingDetails(bookingId);
                            break;

                        case "cancel_booking":
                            const cancelId = parseInt(toolCall.args.bookingId);
                            if (isNaN(cancelId)) {
                                return "I need a valid booking ID number to cancel.";
                            }
                            toolResult = await bookingTools.cancelTicket(cancelId);
                            break;

                        case "book_ticket":
                            toolResult = await bookingTools.bookTicket(
                                toolCall.args.tripId,
                                userId,
                                toolCall.args.pickupId,
                                toolCall.args.dropId,
                                toolCall.args.amount
                            );
                            break;

                        default:
                            // Check if it's an MCP tool managed by any connected server
                            if (toolToClientMap.has(toolCall.tool)) {
                                console.log(`🌍 Executing MCP tool via server: ${toolCall.tool}`);
                                const client = toolToClientMap.get(toolCall.tool);

                                try {
                                    // Transform to match server expectations
                                    let transformedArgs = toolCall.args;

                                    // --- GOOGLE CALENDAR SPECIFIC NORMS ---
                                    if (toolCall.tool === "create-event") {
                                        transformedArgs = { ...toolCall.args };

                                        const placeholders = ['value', 'your_account', 'user', 'default', 'account', 'normal'];
                                        if (!transformedArgs.account || placeholders.includes(transformedArgs.account)) {
                                            transformedArgs.account = 'personal';
                                        }
                                        if (!transformedArgs.calendarId) transformedArgs.calendarId = 'primary';

                                        // Flatten if nested
                                        if (transformedArgs.event) {
                                            const evt = transformedArgs.event;
                                            transformedArgs = { ...transformedArgs, ...evt };
                                            delete transformedArgs.event;
                                        }

                                        // Fix dates
                                        if (typeof transformedArgs.start === 'object') transformedArgs.start = transformedArgs.start.dateTime || transformedArgs.start.date;
                                        if (typeof transformedArgs.end === 'object') transformedArgs.end = transformedArgs.end.dateTime || transformedArgs.end.date;
                                    }

                                    if (toolCall.tool === "list-events") {
                                        transformedArgs = { ...toolCall.args };
                                        if (!transformedArgs.account) transformedArgs.account = 'personal';
                                        if (!transformedArgs.calendarId) transformedArgs.calendarId = 'primary';
                                    }

                                    // --- GOOGLE SHEETS SPECIFIC NORMS (Optional) ---
                                    // Add logic here if specific sheet arg transformation is needed

                                    // CALL THE TOOL
                                    const mcpResult = await client!.callTool({
                                        name: toolCall.tool,
                                        arguments: transformedArgs
                                    });

                                    // Extract text from MCP response
                                    toolResult = (mcpResult.content as any[])
                                        .map((c: any) => c.type === 'text' ? c.text : '')
                                        .join('\n');

                                    // Truncate if too long
                                    if (toolResult && toolResult.length > 4000) {
                                        toolResult = toolResult.substring(0, 4000) + "\n... (Truncated)";
                                    }
                                } catch (mcpError: any) {
                                    console.error(`❌ MCP tool execution failed for ${toolCall.tool}:`, mcpError);
                                    toolResult = `External Tool Error: ${mcpError.message}`;
                                }
                            } else {
                                console.warn(`⚠️ Unknown tool: ${toolCall.tool}`);
                                return "I couldn't understand which action to perform. Could you rephrase?";
                            }
                    }

                    console.log(`📊 Tool result: ${toolResult.substring(0, 100)}...`);

                    // D. Feed result back to AI for natural response
                    const finalResponse = await hf.chatCompletion({
                        model: model,
                        messages: [
                            { role: "system", content: buildSystemInstruction() },
                            { role: "user", content: userMessage },
                            { role: "assistant", content: jsonStr },
                            { role: "user", content: `Tool Output: ${toolResult}. Respond to the user's original request using this information. Do not mention the tool usage or technical details.` }
                        ],
                        max_tokens: 300
                    });

                    const finalContent = finalResponse.choices[0]?.message?.content;
                    console.log(`🤖 Final AI Response: ${finalContent}`);
                    return finalContent;

                } catch (parseError) {
                    console.error("❌ JSON Parse Error:", parseError);
                    // If JSON parsing fails, treat as normal response
                    return content;
                }
            }

            // E. No tool call detected - return conversational response
            return content;

        } catch (error: any) {
            console.warn(`⚠️ Model ${model} failed:`, error.message);
            lastError = error;
            continue; // Try next model
        }
    }

    // All models failed
    console.error("❌ All models failed:", lastError);
    return "I'm having trouble processing your request right now. Please try again in a moment.";
};