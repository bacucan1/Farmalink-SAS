import mongoose from 'mongoose';

class Database {
  private static instance: Database;
  private connected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      console.log('MongoDB ya conectado');
      return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmalink';

    try {
      await mongoose.connect(mongoUri);
      this.connected = true;
      console.log('MongoDB conectado exitosamente');
    } catch (error) {
      console.error('Error conectando a MongoDB:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) return;
    await mongoose.disconnect();
    this.connected = false;
    console.log('MongoDB desconectado');
  }
}

export default Database;
