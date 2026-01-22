// src/config/database.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '209.38.26.237',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'S4007591',
  password: process.env.DB_PASSWORD || 'S4007591',
  database: process.env.DB_NAME || 'S4007591',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  charset: 'utf8mb4'
};

export const db = mysql.createPool(dbConfig);

// Test connection and create tables
const testConnection = async (): Promise<void> => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const createTables = async (): Promise<void> => {
  try {
    // Check if is_blocked column exists before adding it
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'is_blocked'
    `, [dbConfig.database]);

    // Only add the column if it doesn't exist
    if ((columns as any[]).length === 0) {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added is_blocked column to users table');
    } else {
      console.log('✅ is_blocked column already exists in users table');
    }

    // Check if course_assignments table exists
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'course_assignments'
    `, [dbConfig.database]);

    // Only create the table if it doesn't exist
    if ((tables as any[]).length === 0) {
      await db.query(`
        CREATE TABLE course_assignments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          course_id INT NOT NULL,
          lecturer_id INT NOT NULL,
          semester VARCHAR(20) NOT NULL,
          year INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_assignment (course_id, lecturer_id, semester, year),
          INDEX idx_course_id (course_id),
          INDEX idx_lecturer_id (lecturer_id)
        )
      `);
      console.log('✅ Created course_assignments table');

      // Try to add foreign key constraints (optional - will work without them)
      try {
        await db.query(`
          ALTER TABLE course_assignments
          ADD CONSTRAINT fk_course_assignments_course 
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        `);
        
        await db.query(`
          ALTER TABLE course_assignments
          ADD CONSTRAINT fk_course_assignments_lecturer 
          FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✅ Added foreign key constraints');
      } catch (fkError: any) {
        console.log('⚠️  Foreign key constraints not added (table will still work):', fkError.message);
      }
    } else {
      console.log('✅ course_assignments table already exists');
    }

    console.log('✅ Database tables verified/created successfully');
  } catch (error: any) {
    console.error('❌ Error creating tables:', error.message);
    // Don't exit the process - the app can still work with existing tables
  }
};

// Initialize database connection
testConnection();