import pg from 'pg';
const { Pool } = pg;
class Database {
    constructor() {
        this.pool = null;
        this.connected = false;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.connected) {
            console.log('PostgreSQL ya conectado');
            return;
        }
        this.pool = new Pool({
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            ssl: {
                rejectUnauthorized: false,
            },
        });
        try {
            const client = await this.pool.connect();
            client.release();
            this.connected = true;
            console.log('PostgreSQL conectado exitosamente');
        }
        catch (error) {
            console.error('Error conectando a PostgreSQL:', error);
            throw error;
        }
    }
    getPool() {
        if (!this.pool) {
            throw new Error('Database not initialized. Call connect() first.');
        }
        return this.pool;
    }
    isConnected() {
        return this.connected;
    }
    async disconnect() {
        if (!this.pool || !this.connected)
            return;
        await this.pool.end();
        this.connected = false;
        console.log('PostgreSQL desconectado');
    }
}
export default Database;
//# sourceMappingURL=db.js.map