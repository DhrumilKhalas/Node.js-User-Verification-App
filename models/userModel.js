import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  tc: {
    type: Boolean,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
// "User" = table name

export default User;
