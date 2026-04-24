import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabaseUrl = 'https://crqppavmbqywcagmjrlo.supabase.co';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const anonKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(supabaseUrl, anonKey);

const { Client } = pg;
const connectionString = "postgresql://postgres.crqppavmbqywcagmjrlo:XWSi_9S^ateAW^:@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function setup() {
  try {
    // 1. Setup DB Table
    await client.connect();
    await client.query(`
      DROP TABLE IF EXISTS morning_bliss;
      CREATE TABLE morning_bliss (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        class_id TEXT NOT NULL,
        student_id INTEGER NOT NULL,
        topic TEXT NOT NULL,
        mark INTEGER NOT NULL,
        photos TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
      DO $$
      BEGIN
        BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE morning_bliss; EXCEPTION WHEN duplicate_object THEN NULL; END;
      END;
      $$;
    `);
    console.log("Database table Morning Bliss successfully recreated!");

    // 2. Setup Storage Bucket
    const { data, error } = await supabase.storage.createBucket('morning_bliss_photos', { public: true });
    if (error) {
      if (error.message.includes('already exists')) console.log("Bucket already exists.");
      else console.error("Storage Error:", error);
    } else {
      console.log("Storage bucket created successfully!");
    }

    // Attempt to make policies for storage using Postgres directly so anon can upload
    await client.query(`
      insert into storage.policies (name, definition, bucket_id, role)
      values ('public allow auth', 'true', 'morning_bliss_photos', 'anon')
      on conflict do nothing;
    `);

  } catch (err) {
    console.error("Script failed:", err);
  } finally {
    await client.end();
  }
}

setup();
