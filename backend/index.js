import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({
  origin: process.env.FRONT_ORIGIN,
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
};

startServer();