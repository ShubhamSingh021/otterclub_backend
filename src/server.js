import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    await connectDatabase(env.mongoUri);
    app.listen(env.port, () => {
      console.log(`Backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
