import postgres from 'postgres'
import "dotenv/config";

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error("❌ DATABASE_URL is not set in environment!");
} else {
    const masked = connectionString.replace(/:([^@]+)@/, ":****@");
    console.log(`📡 Connecting to database at ${masked}`);
}
const sql = postgres(connectionString, { ssl: 'require' })

export default sql