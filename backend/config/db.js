const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use memory server if MONGO_URI is localhost and fails, or simply override for easy setup
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected (In-Memory Database): ${conn.connection.host}`);
    console.log(`   URI: ${mongoUri}`);
    
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
