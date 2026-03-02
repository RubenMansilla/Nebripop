const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.zxetwkoirtyweevvatuf:nebripopnebrija@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function runMigration() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('Connected to database');

    try {
        // Add held_balance to users table
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS held_balance NUMERIC(10,2) NOT NULL DEFAULT 0;
        `);
        console.log('✅ Added held_balance column to users table');

        // Add held_balance to wallets table
        await client.query(`
            ALTER TABLE wallets 
            ADD COLUMN IF NOT EXISTS held_balance NUMERIC(12,2) NOT NULL DEFAULT 0;
        `);
        console.log('✅ Added held_balance column to wallets table');

        // Verify the columns exist
        const result = await client.query(`
            SELECT column_name, data_type, table_name 
            FROM information_schema.columns 
            WHERE table_name IN ('users', 'wallets') 
            AND column_name = 'held_balance';
        `);

        console.log('\n📋 Verified columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.table_name}.${row.column_name} (${row.data_type})`);
        });

        console.log('\n✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

runMigration().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
