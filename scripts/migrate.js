const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlLine = envFile.split('\n').find(line => line.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.substring('DATABASE_URL='.length).replace(/['"]/g, '').trim();

const sql = neon(dbUrl);

async function main() {
  try {
    await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID`;
    console.log('user_id column added successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
