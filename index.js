import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 8200;
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routes/userRoutes.js";

const app = express();

// cors policy
app.use(cors());
// json
app.use(express.json());
// load routes
app.use("/api/user", userRouter);

// database connection
const connection = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB!"))
    .catch((err) => console.log("Error connecting to MongoDB!", err));
};

app.get("/", (req, res) => {
  res.send("Hello from the server side!");
});

// server
app.listen(PORT, () => {
  connection();
  console.log(`Server is running on port ${PORT}.`);
});
