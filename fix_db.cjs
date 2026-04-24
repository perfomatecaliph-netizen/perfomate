const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.crqppavmbqywcagmjrlo:XWSi_9S^ateAW^:@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS short_name TEXT;");
  console.log("Updated users table");
  await client.query("ALTER TABLE morning_bliss ADD COLUMN IF NOT EXISTS evaluated_by TEXT;");
  console.log("Updated morning_bliss table");
  await client.end();
  console.log("Done");
}

run().catch(console.error);
