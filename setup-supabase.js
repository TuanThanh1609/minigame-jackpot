const { Client } = require('pg');

const client = new Client({
  host: 'supabasekong-s4gsswk4og8cskk4o04o008o.42.96.13.252.sslip.io',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'ygH8VsHPhkn1PvPjqPj4AEM7AzPi4ODp',
});

async function run() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!');

    // 1. Drop tables if exist (for clean setup)
    console.log('\n🧹 Cleaning old tables...');
    await client.query(`DROP TABLE IF EXISTS spin_results CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS leads CASCADE;`);
    console.log('✅ Old tables dropped.');

    // 2. Create leads table
    console.log('\n📋 Creating leads table...');
    await client.query(`
      CREATE TABLE leads (
        id BIGSERIAL PRIMARY KEY,
        phone TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ leads table created.');

    // 3. Create spin_results table
    console.log('\n📋 Creating spin_results table...');
    await client.query(`
      CREATE TABLE spin_results (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
        reel1 INTEGER NOT NULL CHECK (reel1 BETWEEN 0 AND 9),
        reel2 INTEGER NOT NULL CHECK (reel2 BETWEEN 0 AND 9),
        reel3 INTEGER NOT NULL CHECK (reel3 BETWEEN 0 AND 9),
        is_win BOOLEAN NOT NULL DEFAULT FALSE,
        prize_code TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ spin_results table created.');

    // 4. Disable RLS for public access (anon key)
    console.log('\n🔓 Setting up RLS policies...');
    await client.query(`ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE spin_results ENABLE ROW LEVEL SECURITY;`);

    // Allow INSERT/UPDATE/SELECT from anon role
    await client.query(`DROP POLICY IF EXISTS "Allow anon all leads" ON leads;`);
    await client.query(`DROP POLICY IF EXISTS "Allow anon all spin_results" ON spin_results;`);

    await client.query(`
      CREATE POLICY "Allow anon all leads" ON leads
        FOR ALL TO anon USING (true) WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "Allow anon all spin_results" ON spin_results
        FOR ALL TO anon USING (true) WITH CHECK (true);
    `);
    console.log('✅ RLS policies created.');

    // 5. Grant permissions
    console.log('\n🔑 Granting permissions...');
    await client.query(`GRANT ALL ON leads TO anon;`);
    await client.query(`GRANT ALL ON spin_results TO anon;`);
    await client.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;`);
    console.log('✅ Permissions granted.');

    // 6. Verify
    console.log('\n🔍 Verifying tables...');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    tables.rows.forEach(r => console.log('  - ' + r.table_name));

    // 7. Test INSERT
    console.log('\n🧪 Testing INSERT into leads...');
    const insertLead = await client.query(`
      INSERT INTO leads (phone) VALUES ('0381234567') RETURNING id, phone, created_at;
    `);
    console.log('  Result:', JSON.stringify(insertLead.rows[0]));

    const leadId = insertLead.rows[0].id;

    console.log('🧪 Testing INSERT into spin_results...');
    const insertSpin = await client.query(`
      INSERT INTO spin_results (lead_id, reel1, reel2, reel3, is_win, prize_code)
      VALUES (${leadId}, 7, 7, 7, true, 'JACKPOT')
      RETURNING *;
    `);
    console.log('  Result:', JSON.stringify(insertSpin.rows[0]));

    // 8. Test SELECT
    console.log('\n🧪 Testing SELECT...');
    const leads = await client.query('SELECT * FROM leads;');
    console.log('  Leads:', JSON.stringify(leads.rows));
    const spins = await client.query('SELECT * FROM spin_results;');
    console.log('  Spin results:', JSON.stringify(spins.rows));

    // Cleanup test data
    await client.query('DELETE FROM spin_results;');
    await client.query('DELETE FROM leads;');
    console.log('\n🧹 Test data cleaned.');

    console.log('\n🎉 SETUP COMPLETE! Supabase is ready for Jackpot 777!');
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
