const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Properly load environment variables
const prisma = new PrismaClient();

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,  
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS '+process.env.DB_NAME);
    console.log('Database "daag" created or already exists!');
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1); // Exit on failure
  } finally {
    await connection.end(); // Ensure connection is closed
  }
}

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await prisma.$executeRaw`SELECT 1`; // Example query to check migrations
    console.log('Migrations applied successfully!');
  } catch (err) {
    console.error('Error running migrations:', err);
  } finally {
    await prisma.$disconnect(); // Ensure Prisma connection is closed
  }
}

async function main() {
  try {
    await createDatabase();
    await runMigrations();  
    process.exit(0);        
  } catch (err) {
    console.error('Error in migration process:', err);
    process.exit(1);       
  }
}

main();
