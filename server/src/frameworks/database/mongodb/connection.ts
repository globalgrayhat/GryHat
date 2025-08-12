import mongoose from "mongoose";
import configKeys from "../../../config";
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect(configKeys.DB_CLUSTER_URL, {
      dbName: configKeys.DB_NAME,
    });
    console.log("\x1b[42m%s\x1b[0m", "Database connected successfully");
  } catch (error: any) {
    console.error("\x1b[31m%s\x1b[0m", "Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
