import { Client } from 'pg';
import { config } from 'dotenv';

config();

const createDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres'
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE sportmate');
    console.log('Database "sportmate" created successfully');
  } catch (error: any) {
    if (error.code === '42P04') {
      console.log('Database "sportmate" already exists');
    } else {
      console.error('Error creating database:', error);
    }
  } finally {
    await client.end();
  }
};

createDatabase();
