// src/prisma/index.ts

import { PrismaClient } from '@prisma/client';

// Initialize the Client
// We don't need to pass arguments; it reads the .env file automatically.
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Optional: Shows SQL logs in terminal
});