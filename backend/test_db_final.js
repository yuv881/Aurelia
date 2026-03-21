import postgres from 'postgres';

const directUrl = 'postgresql://postgres:Yuvraj%402807@db.trketisggpzkgryepooo.supabase.co:5432/postgres';
const sql = postgres(directUrl, { ssl: 'require', connect_timeout: 10 });

async function test() {
    try {
        console.log('Testing direct connection...');
        const result = await sql`SELECT 1 as connected`;
        console.log('Success:', result[0].connected);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sql.end();
    }
}

test();
