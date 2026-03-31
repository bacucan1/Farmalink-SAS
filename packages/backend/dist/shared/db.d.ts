import pg from 'pg';
declare class Database {
    private static instance;
    private pool;
    private connected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    getPool(): pg.Pool;
    isConnected(): boolean;
    disconnect(): Promise<void>;
}
export default Database;
//# sourceMappingURL=db.d.ts.map