import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`[server] DevPMS API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  }
}

start();

process.on("unhandledRejection", (err) => {
  console.error("[server] unhandled rejection:", err);
});
