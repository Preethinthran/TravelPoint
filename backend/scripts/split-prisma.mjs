import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const schemaPath = path.join(__dirname, "../src/prisma/schema.prisma");
const modelsPath = path.join(__dirname, "../src/models");

// Ensure models directory exists
if (!fs.existsSync(modelsPath)) {
  fs.mkdirSync(modelsPath, { recursive: true });
}

// Read schema.prisma file
const schemaContent = fs.readFileSync(schemaPath, "utf8");

// Extract `generator` and `datasource` (keep them in schema.prisma)
const generatorAndDatasource = schemaContent.split("model ")[0].trim();

// Extract model blocks using regex
const modelBlocks = schemaContent.match(/model\s+\w+\s+\{[^}]+\}/gs) || [];

// Write each model into a separate file
modelBlocks.forEach((model) => {
  const modelName = model.split(" ")[1]; // Extract model name
  fs.writeFileSync(path.join(modelsPath, `${modelName}.prisma`), model.trim());
});

console.log("✅ Models successfully extracted into individual files.");