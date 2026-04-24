import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.crqppavmbqywcagmjrlo:XWSi_9S^ateAW^:@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function updateSchema() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS point_rules (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        reason TEXT NOT NULL,
        value INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      ALTER TABLE students ADD COLUMN IF NOT EXISTS tally_points INTEGER DEFAULT 0;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS star_points INTEGER DEFAULT 0;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS other_points INTEGER DEFAULT 0;

      DO $$
      BEGIN
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE point_rules; EXCEPTION WHEN duplicate_object THEN NULL; END;
      END;
      $$;
    `);

    console.log("Point Rules table and student columns updated successfully!");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await client.end();
  }
}

updateSchema();
