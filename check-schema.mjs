import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_kg8lVPxOBF9I@ep-hidden-flower-b4n7i0pq-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
async function run() {
  const result = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'`;
  console.log(JSON.stringify(result, null, 2));
}
run();
