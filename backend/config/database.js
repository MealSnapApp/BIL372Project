require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'snapmeal_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

async function initializeDatabase() {
  try {
    // Connect to MySQL server (without specifying database) to check/create DB
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    console.log(`Database ${DB_NAME} checked/created successfully.`);
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
});

module.exports = { sequelize, initializeDatabase };
