import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { google } from "googleapis";
import * as path from "path";
import * as fs from "fs";

// Paths
// This file is in src/mcp-sheets/index.ts, so ../../ goes to backend root
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "../../service-account-sheets.json");

// Create the server
const server = new McpServer({
    name: "GoogleSheets-ServiceAccount",
    version: "1.1.0",
});

/**
 * Authentication Helper (Service Account)
 * Uses the JSON key file for server-to-server authentication.
 */
async function getAuthClient() {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        throw new Error(`Service account file not found at ${SERVICE_ACCOUNT_PATH}. Please ensure you have the 'service-account-sheets.json' file in your backend root.`);
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return await auth.getClient();
}

/**
 * TOOL: Create Spreadsheet
 * Note: The service account will be the owner of the created sheet.
 * Users must share the sheet with the service account email or vice-versa to see it.
 */
server.tool(
    "sheets_create_spreadsheet",
    {
        title: z.string().describe("The name of the new spreadsheet"),
        headers: z.array(z.string()).optional().describe("Optional array of headers for the first row")
    },
    async ({ title, headers }) => {
        try {
            const auth = await getAuthClient() as any;
            const sheets = google.sheets({ version: 'v4', auth });

            // 1. Create the spreadsheet
            const createRes = await sheets.spreadsheets.create({
                requestBody: {
                    properties: { title }
                }
            });

            const spreadsheetId = createRes.data.spreadsheetId;
            const url = createRes.data.spreadsheetUrl;

            // 2. Add headers if provided
            if (headers && headers.length > 0 && spreadsheetId) {
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: "Sheet1!A1",
                    valueInputOption: "RAW",
                    requestBody: {
                        values: [headers]
                    }
                });
            }

            return {
                content: [{
                    type: "text",
                    text: `✅ Spreadsheet Created Successfully!\n\n` +
                        `📌 Title: ${title}\n` +
                        `🆔 ID: ${spreadsheetId}\n` +
                        `🔗 URL: ${url}\n\n` +
                        `⚠️ NOTE: This spreadsheet is owned by the service account. To view it, check the URL above or ensure it is shared with your personal Google account email.`
                }]
            };

        } catch (error: any) {
            return {
                content: [{ type: "text", text: `❌ Error creating spreadsheet: ${error.message}` }],
                isError: true
            };
        }
    }
);

/**
 * TOOL: Append Values
 * Appends rows of data to an existing spreadsheet.
 */
server.tool(
    "sheets_append_values",
    {
        spreadsheetId: z.string().describe("The ID of the spreadsheet (the long string in the browser URL)"),
        values: z.array(z.array(z.string().or(z.number()))).describe("A 2D array of values to append (Array of Arrays)"),
        range: z.string().optional().default("Sheet1!A1").describe("The sheet name and range (e.g., 'Sheet1!A1')")
    },
    async ({ spreadsheetId, values, range }) => {
        try {
            const auth = await getAuthClient() as any;
            const sheets = google.sheets({ version: 'v4', auth });

            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: "RAW",
                requestBody: { values }
            });

            return {
                content: [{ type: "text", text: `✅ Successfully appended ${values.length} rows to the spreadsheet (ID: ${spreadsheetId}).` }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `❌ Error appending data: ${error.message}` }],
                isError: true
            };
        }
    }
);

/**
 * MCP Server Execution logic
 */
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 Sheets MCP Server (Service Account) started");
}

run().catch((error) => {
    // Log fatal errors to stderr to prevent breaking the JSON-RPC protocol on stdout
    console.error("Fatal Sheets MCP Error:", error);
    process.exit(1);
});

