import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Update schemaPath to match the new location inside src/prisma
const schemaPath = path.join(__dirname, "../src/prisma/schema.prisma");

// ✅ Update modelsPath if your models are inside src/models
const modelsPath = path.join(__dirname, "../src/models");

const generatorAndDatasource = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
`;

const models = fs.readdirSync(modelsPath)
  .filter(file => file.endsWith(".prisma"))
  .map(file => fs.readFileSync(path.join(modelsPath, file), "utf8"))
  .join("\n\n");

fs.writeFileSync(schemaPath, generatorAndDatasource + "\n\n" + models);

console.log("✅ Prisma schema.prisma successfully updated with all models.");
