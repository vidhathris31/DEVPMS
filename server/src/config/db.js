import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  console.log(`[db] connected → ${mongoose.connection.host}/${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected");
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
