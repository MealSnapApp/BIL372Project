require('dotenv').config();
const { Sequelize } = require('sequelize');
// const mysql = require('mysql2/promise'); // Commented out for SQLite

const DB_NAME = process.env.DB_NAME || 'snapmeal_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

async function initializeDatabase() {
  // SQLite creates the file automatically, so we don't need to create DB manually
  console.log('Using SQLite - Database file will be created automatically if not exists.');
  return Promise.resolve();
  
  /* MySQL Initialization - Commented out
  try {
    console.log('Attempting to connect to MySQL...');
    console.log(`Host: ${DB_HOST}, Port: ${DB_PORT}, User: ${DB_USER}`);
    
    // Connect to MySQL server (without specifying database) to check/create DB
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    console.log(`Database ${DB_NAME} checked/created successfully.`);
  } catch (error) {
    console.error('Error creating database:', error.code, error.message);
    console.error('Connection details:', { DB_HOST, DB_PORT, DB_USER });
    console.error('Full error:', error);
    // process.exit(1); // Don't exit, just log error
  }
  */
}

// SQLite Configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database_v4.sqlite', // SQLite file path
  logging: false
});

/* MySQL Configuration - Commented out
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
});
*/

module.exports = { sequelize, initializeDatabase };
