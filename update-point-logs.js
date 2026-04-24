import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.crqppavmbqywcagmjrlo:XWSi_9S^ateAW^:@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function updateSchema() {
  try {
    await client.connect();
    console.log("Connected to Supabase!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS point_logs (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        reason TEXT NOT NULL,
        value INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      DO $$
      BEGIN
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE point_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
      END;
      $$;
    `);

    console.log("Point Logs table created successfully!");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await client.end();
  }
}

updateSchema();
