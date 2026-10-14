const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlLine = envFile.split('\n').find(line => line.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.substring('DATABASE_URL='.length).replace(/['"]/g, '').trim();

const sql = neon(dbUrl);

async function main() {
  const oldId = '0070fef9-c52b-4243-9c1e-c0d6c111480d';
  const newId = '4abcf205-6237-4902-8260-f589ec4e4979';

  try {
    const events = await sql`SELECT * FROM events WHERE id = ${oldId}`;
    if (events.length === 0) {
      console.log("Event not found!");
      return;
    }

    const e = events[0];
    
    // Insert new event
    await sql`
      INSERT INTO events (id, title, description, date, venue, location, image_url, organizer, created_at, user_id)
      VALUES (${newId}, ${e.title}, ${e.description}, ${e.date}, ${e.venue}, ${e.location}, ${e.image_url}, ${e.organizer}, ${e.created_at}, ${e.user_id})
    `;
    console.log("Created new event duplicate.");

    // Update ticket packages to point to new ID
    await sql`
      UPDATE ticket_packages
      SET event_id = ${newId}
      WHERE event_id = ${oldId}
    `;
    console.log("Reassigned ticket packages to new event.");

    // Delete old event
    await sql`
      DELETE FROM events
      WHERE id = ${oldId}
    `;
    console.log("Deleted old event. Update complete!");

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
