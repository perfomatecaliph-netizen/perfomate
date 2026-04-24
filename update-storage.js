import pg from 'pg';
const { Client } = pg;
const connectionString = "postgresql://postgres.crqppavmbqywcagmjrlo:XWSi_9S^ateAW^:@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function setup() {
  await client.connect();
  
  try {
     await client.query(`
      INSERT INTO storage.buckets (id, name, public) VALUES ('morning_bliss_photos', 'morning_bliss_photos', true) ON CONFLICT DO NOTHING;
     `);
     console.log("Storage bucket created");
     
     await client.query(`
       CREATE POLICY "Give public access to morning_bliss_photos" ON storage.objects FOR ALL USING (bucket_id = 'morning_bliss_photos');
     `);
     console.log("Rls attached");
  } catch (e) {
     console.error(e);
  } finally {
     await client.end();
  }
}

setup();
