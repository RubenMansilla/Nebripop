const { Client } = require('pg');
const DATABASE_URL = 'postgresql://postgres.zxetwkoirtyweevvatuf:nebripopnebrija@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function fix() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        // Reset 'completed' auctions that should have been processed by the scheduler
        // If they have bids and no winner_id, they were likely hit by the placeBid bug
        const res = await client.query(`
            UPDATE auctions 
            SET status = 'active' 
            WHERE status = 'completed' 
              AND winner_id IS NULL;
        `);

        console.log(`Successfully reset ${res.rowCount} auctions to 'active' state.`);
        console.log('The scheduler will pick them up in its next run.');

    } catch (err) {
        console.error('Error during DB fix:', err);
    } finally {
        await client.end();
    }
}

fix();
