import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.crqppavmbqywcagmjrlo:XWSi_9S^ateAW^:@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS fines (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES students(id) ON DELETE CASCADE,
        student_name TEXT NOT NULL,
        class_name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unpaid',
        date DATE NOT NULL DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS morning_bliss (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        student_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS prayer_attendance (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        class_name TEXT NOT NULL,
        prayer TEXT NOT NULL,
        student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS phone_passes (
        id SERIAL PRIMARY KEY,
        student_name TEXT NOT NULL,
        reason TEXT NOT NULL,
        time_issued TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS gate_passes (
        id SERIAL PRIMARY KEY,
        student_name TEXT NOT NULL,
        reason TEXT NOT NULL,
        time_return TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'out'
      );

      DO $$
      BEGIN
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE fines; EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE morning_bliss; EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE prayer_attendance; EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE phone_passes; EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE gate_passes; EXCEPTION WHEN duplicate_object THEN NULL; END;
      END;
      $$;
    `);

    console.log("Additional tables created successfully!");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await client.end();
  }
}

setupDatabase();
