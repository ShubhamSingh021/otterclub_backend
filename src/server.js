import mongoose from "mongoose"; 
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    await connectDatabase(env.mongoUri);
    
    // Explicitly drop the old unique index if it exists to allow registration retries
    try {
      const connection = mongoose.connection;
      await connection.collection('registrations').dropIndex('event_1_email_1');
      console.log("Old unique index 'event_1_email_1' dropped successfully.");
    } catch (e) {
      // Index might already be gone or not exist
    }

    app.listen(env.port, () => {
      console.log(`Backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
