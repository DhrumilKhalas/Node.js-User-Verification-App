import express from "express";
import {
  userRegistration,
  userLogin,
  changeUserPassword,
  loggedUser,
  sendUserPasswordResetEmail,
  userPasswordReset,
} from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const userRouter = express.Router();

// route level middleware - to protect route
userRouter.use("/changepassword", checkUserAuth);
userRouter.use("/loggeduser", checkUserAuth);

// public route
userRouter.post("/register", userRegistration);
userRouter.post("/login", userLogin);
userRouter.post("/send-reset-password-email", sendUserPasswordResetEmail);
userRouter.post("/reset-password/:id/:token", userPasswordReset);

// protected route
userRouter.post("/changepassword", changeUserPassword);
userRouter.get("/loggeduser", loggedUser);

export default userRouter;
