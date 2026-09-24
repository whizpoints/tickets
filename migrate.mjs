import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_kg8lVPxOBF9I@ep-hidden-flower-b4n7i0pq-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
async function run() {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password character varying(255)`;
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_request_id VARCHAR(255)`;
  console.log("Migration successful");
}
run();
